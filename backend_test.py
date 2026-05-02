#!/usr/bin/env python3
"""
Comprehensive backend testing for Northeast India Handicrafts Museum API
Tests all endpoints against the public preview URL with proper authentication
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://heritage-ai-india.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NE-Crafts-Backend-Tester/1.0'
        })
        self.admin_token = None
        self.regular_user_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, expect_status: int = 200) -> tuple:
        """Make API request and return (success, response, status_code)"""
        try:
            url = f"{API_BASE}/{endpoint}" if not endpoint.startswith('http') else endpoint
            
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                return False, None, 0
                
            success = response.status_code == expect_status
            try:
                json_data = response.json()
            except:
                json_data = {"text": response.text}
                
            return success, json_data, response.status_code
            
        except Exception as e:
            print(f"    Request error: {str(e)}")
            return False, {"error": str(e)}, 0

    def test_health_endpoint(self):
        """Test 1: GET /api/health"""
        success, data, status = self.make_request('GET', 'health')
        if success and data.get('ok') == True and data.get('name') == 'NE Crafts API':
            self.log_test("Health endpoint", True, f"Response: {data}")
        else:
            self.log_test("Health endpoint", False, f"Status: {status}, Data: {data}")

    def test_meta_endpoint(self):
        """Test 2: GET /api/meta"""
        success, data, status = self.make_request('GET', 'meta')
        if success and 'states' in data and 'categories' in data:
            states = data.get('states', [])
            categories = data.get('categories', [])
            expected_states = ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura']
            
            if len(states) == 8 and len(categories) == 7:
                self.log_test("Meta endpoint", True, f"8 states, 7 categories returned")
            else:
                self.log_test("Meta endpoint", False, f"Expected 8 states & 7 categories, got {len(states)} states & {len(categories)} categories")
        else:
            self.log_test("Meta endpoint", False, f"Status: {status}, Data: {data}")

    def test_crafts_endpoints(self):
        """Test 3-8: Crafts endpoints"""
        
        # Test 3: GET /api/crafts (all crafts)
        success, data, status = self.make_request('GET', 'crafts')
        if success and 'crafts' in data and data.get('count') == 30:
            self.log_test("Get all crafts", True, f"30 crafts returned")
            crafts = data['crafts']
        else:
            self.log_test("Get all crafts", False, f"Status: {status}, Expected 30 crafts, got: {data}")
            return
            
        # Test 4: GET /api/crafts?state=Assam
        success, data, status = self.make_request('GET', 'crafts?state=Assam')
        if success and 'crafts' in data:
            assam_crafts = data['crafts']
            assam_count = len([c for c in assam_crafts if c.get('state') == 'Assam'])
            if assam_count == len(assam_crafts) and assam_count >= 3:  # Should have at least 3-4 Assam crafts
                self.log_test("Filter crafts by state (Assam)", True, f"{assam_count} Assam crafts returned")
            else:
                self.log_test("Filter crafts by state (Assam)", False, f"Expected Assam crafts only, got mixed or wrong count: {assam_count}")
        else:
            self.log_test("Filter crafts by state (Assam)", False, f"Status: {status}, Data: {data}")
            
        # Test 5: GET /api/crafts?category=Weaving
        success, data, status = self.make_request('GET', 'crafts?category=Weaving')
        if success and 'crafts' in data:
            weaving_crafts = data['crafts']
            weaving_count = len([c for c in weaving_crafts if c.get('category') == 'Weaving'])
            if weaving_count == len(weaving_crafts) and weaving_count >= 2:
                self.log_test("Filter crafts by category (Weaving)", True, f"{weaving_count} weaving crafts returned")
            else:
                self.log_test("Filter crafts by category (Weaving)", False, f"Expected Weaving crafts only, got: {weaving_count}")
        else:
            self.log_test("Filter crafts by category (Weaving)", False, f"Status: {status}, Data: {data}")
            
        # Test 6: GET /api/crafts?q=silk (fuzzy search)
        success, data, status = self.make_request('GET', 'crafts?q=silk')
        if success and 'crafts' in data:
            silk_crafts = data['crafts']
            silk_count = len(silk_crafts)
            # Should find Muga silk, Eri silk and others mentioning silk
            if silk_count >= 2:
                self.log_test("Search crafts (silk)", True, f"{silk_count} silk-related crafts found")
            else:
                self.log_test("Search crafts (silk)", False, f"Expected multiple silk crafts, got: {silk_count}")
        else:
            self.log_test("Search crafts (silk)", False, f"Status: {status}, Data: {data}")
            
        # Test 7: GET /api/crafts/majuli-masks (single craft)
        success, data, status = self.make_request('GET', 'crafts/majuli-masks')
        if success and 'craft' in data:
            craft = data['craft']
            if craft.get('id') == 'majuli-masks' and craft.get('name'):
                self.log_test("Get single craft (majuli-masks)", True, f"Craft: {craft.get('name')}")
            else:
                self.log_test("Get single craft (majuli-masks)", False, f"Wrong craft returned: {craft}")
        else:
            self.log_test("Get single craft (majuli-masks)", False, f"Status: {status}, Data: {data}")
            
        # Test 8: GET /api/crafts/non-existent-id (404)
        success, data, status = self.make_request('GET', 'crafts/non-existent-id', expect_status=404)
        if success and status == 404:
            self.log_test("Get non-existent craft (404)", True, "Correctly returned 404")
        else:
            self.log_test("Get non-existent craft (404)", False, f"Expected 404, got status: {status}")

    def test_auth_endpoints(self):
        """Test 9-14: Authentication endpoints"""
        
        # Test 9: POST /api/auth/register
        register_data = {
            "email": "testuser@example.com",
            "password": "testpass123",
            "name": "Test User"
        }
        success, data, status = self.make_request('POST', 'auth/register', register_data)
        if success and 'user' in data and 'token' in data:
            user = data['user']
            if user.get('email') == 'testuser@example.com' and user.get('role') == 'user':
                self.regular_user_token = data['token']
                self.log_test("User registration", True, f"User registered: {user.get('email')}")
            else:
                self.log_test("User registration", False, f"Wrong user data: {user}")
        else:
            self.log_test("User registration", False, f"Status: {status}, Data: {data}")
            
        # Test 10: POST /api/auth/login (admin)
        admin_login_data = {
            "email": "admin@necrafts.in",
            "password": "admin123"
        }
        success, data, status = self.make_request('POST', 'auth/login', admin_login_data)
        if success and 'user' in data and 'token' in data:
            user = data['user']
            if user.get('email') == 'admin@necrafts.in' and user.get('role') == 'admin':
                self.admin_token = data['token']
                self.log_test("Admin login", True, f"Admin logged in: {user.get('email')}")
            else:
                self.log_test("Admin login", False, f"Wrong admin data: {user}")
        else:
            self.log_test("Admin login", False, f"Status: {status}, Data: {data}")
            
        # Test 11: GET /api/auth/me (with cookie)
        if self.admin_token:
            # Set cookie for subsequent requests
            self.session.cookies.set('ne_token', self.admin_token)
            success, data, status = self.make_request('GET', 'auth/me')
            if success and 'user' in data:
                user = data['user']
                if user.get('role') == 'admin':
                    self.log_test("Get current user (with cookie)", True, f"User: {user.get('email')}")
                else:
                    self.log_test("Get current user (with cookie)", False, f"Wrong user role: {user}")
            else:
                self.log_test("Get current user (with cookie)", False, f"Status: {status}, Data: {data}")
        else:
            self.log_test("Get current user (with cookie)", False, "No admin token available")
            
        # Test 12: GET /api/auth/me (without cookie)
        # Clear cookies temporarily
        old_cookies = self.session.cookies.copy()
        self.session.cookies.clear()
        success, data, status = self.make_request('GET', 'auth/me', expect_status=401)
        if success and status == 401:
            self.log_test("Get current user (without cookie)", True, "Correctly returned 401")
        else:
            self.log_test("Get current user (without cookie)", False, f"Expected 401, got status: {status}")
        # Restore cookies
        self.session.cookies = old_cookies
        
        # Test 13: POST /api/auth/logout
        success, data, status = self.make_request('POST', 'auth/logout')
        if success and data.get('ok') == True:
            self.log_test("User logout", True, "Successfully logged out")
        else:
            self.log_test("User logout", False, f"Status: {status}, Data: {data}")
            
        # Test 14: Duplicate registration
        success, data, status = self.make_request('POST', 'auth/register', register_data, expect_status=409)
        if success and status == 409:
            self.log_test("Duplicate registration (409)", True, "Correctly returned 409")
        else:
            self.log_test("Duplicate registration (409)", False, f"Expected 409, got status: {status}")

    def test_crafts_crud_admin(self):
        """Test 15-19: Admin CRUD operations"""
        
        # Ensure we're logged in as admin
        if not self.admin_token:
            self.log_test("Admin CRUD setup", False, "No admin token available")
            return
            
        self.session.cookies.set('ne_token', self.admin_token)
        
        # Test 15: POST /api/crafts WITHOUT cookie (403)
        self.session.cookies.clear()
        new_craft_data = {
            "id": "test-craft-001",
            "name": "Test Craft",
            "state": "Assam",
            "category": "Weaving",
            "shortDescription": "A test craft for API testing",
            "description": "This is a test craft created during API testing.",
            "materials": ["Cotton", "Silk"],
            "technique": "Hand weaving",
            "motifs": ["Geometric"],
            "colors": "Red, Blue",
            "culturalSignificance": "Test significance"
        }
        success, data, status = self.make_request('POST', 'crafts', new_craft_data, expect_status=403)
        if success and status == 403:
            self.log_test("Create craft without auth (403)", True, "Correctly returned 403")
        else:
            self.log_test("Create craft without auth (403)", False, f"Expected 403, got status: {status}")
            
        # Test 16: POST /api/crafts as REGULAR user (403)
        if self.regular_user_token:
            self.session.cookies.set('ne_token', self.regular_user_token)
            success, data, status = self.make_request('POST', 'crafts', new_craft_data, expect_status=403)
            if success and status == 403:
                self.log_test("Create craft as regular user (403)", True, "Correctly returned 403")
            else:
                self.log_test("Create craft as regular user (403)", False, f"Expected 403, got status: {status}")
        else:
            self.log_test("Create craft as regular user (403)", False, "No regular user token available")
            
        # Test 17: POST /api/crafts as ADMIN (200)
        self.session.cookies.set('ne_token', self.admin_token)
        success, data, status = self.make_request('POST', 'crafts', new_craft_data)
        if success and 'craft' in data:
            craft = data['craft']
            if craft.get('id') == 'test-craft-001' and craft.get('name') == 'Test Craft':
                self.log_test("Create craft as admin", True, f"Created craft: {craft.get('name')}")
                
                # Verify the craft appears in GET
                success2, data2, status2 = self.make_request('GET', 'crafts/test-craft-001')
                if success2 and data2.get('craft', {}).get('id') == 'test-craft-001':
                    self.log_test("Verify created craft in GET", True, "Craft found in GET request")
                else:
                    self.log_test("Verify created craft in GET", False, f"Craft not found: {data2}")
            else:
                self.log_test("Create craft as admin", False, f"Wrong craft data: {craft}")
        else:
            self.log_test("Create craft as admin", False, f"Status: {status}, Data: {data}")
            
        # Test 18: PUT /api/crafts/test-craft-001 (update)
        update_data = {
            "name": "Updated Test Craft",
            "colors": "Green, Yellow"
        }
        success, data, status = self.make_request('PUT', 'crafts/test-craft-001', update_data)
        if success and 'craft' in data:
            craft = data['craft']
            if craft.get('name') == 'Updated Test Craft' and craft.get('colors') == 'Green, Yellow':
                self.log_test("Update craft as admin", True, f"Updated craft name and colors")
            else:
                self.log_test("Update craft as admin", False, f"Update not reflected: {craft}")
        else:
            self.log_test("Update craft as admin", False, f"Status: {status}, Data: {data}")
            
        # Test 19: DELETE /api/crafts/test-craft-001
        success, data, status = self.make_request('DELETE', 'crafts/test-craft-001')
        if success and data.get('ok') == True:
            self.log_test("Delete craft as admin", True, "Craft deleted successfully")
            
            # Verify craft is gone
            success2, data2, status2 = self.make_request('GET', 'crafts/test-craft-001', expect_status=404)
            if success2 and status2 == 404:
                self.log_test("Verify craft deletion", True, "Craft correctly returns 404 after deletion")
            else:
                self.log_test("Verify craft deletion", False, f"Craft still exists: {status2}")
        else:
            self.log_test("Delete craft as admin", False, f"Status: {status}, Data: {data}")

    def test_ai_endpoints(self):
        """Test 20-26: AI endpoints"""
        
        # Test 20: POST /api/ai/summary
        summary_data = {"craftId": "majuli-masks"}
        success, data, status = self.make_request('POST', 'ai/summary', summary_data)
        if success and 'summary' in data:
            summary = data['summary']
            if len(summary) > 50:  # Should be substantial content
                cached = data.get('cached', False)
                self.log_test("AI summary generation", True, f"Summary length: {len(summary)} chars, cached: {cached}")
            else:
                self.log_test("AI summary generation", False, f"Summary too short: {len(summary)} chars")
        else:
            self.log_test("AI summary generation", False, f"Status: {status}, Data: {data}")
            
        # Test 21: Repeat summary call (should be cached)
        success, data, status = self.make_request('POST', 'ai/summary', summary_data)
        if success and 'summary' in data and data.get('cached') == True:
            self.log_test("AI summary caching", True, "Summary returned from cache")
        else:
            self.log_test("AI summary caching", False, f"Expected cached response, got: {data}")
            
        # Test 22: POST /api/ai/chat (first message)
        chat_data = {
            "sessionId": "test-session-1",
            "message": "What is Muga silk?"
        }
        success, data, status = self.make_request('POST', 'ai/chat', chat_data)
        if success and 'reply' in data:
            reply = data['reply']
            if len(reply) > 20:  # Should be substantial response
                self.log_test("AI chat (first message)", True, f"Reply length: {len(reply)} chars")
            else:
                self.log_test("AI chat (first message)", False, f"Reply too short: {len(reply)} chars")
        else:
            self.log_test("AI chat (first message)", False, f"Status: {status}, Data: {data}")
            
        # Test 23: POST /api/ai/chat (follow-up message)
        chat_data2 = {
            "sessionId": "test-session-1",
            "message": "And Eri silk?"
        }
        success, data, status = self.make_request('POST', 'ai/chat', chat_data2)
        if success and 'reply' in data:
            reply = data['reply']
            if len(reply) > 20:
                self.log_test("AI chat (follow-up message)", True, f"Follow-up reply length: {len(reply)} chars")
            else:
                self.log_test("AI chat (follow-up message)", False, f"Follow-up reply too short: {len(reply)} chars")
        else:
            self.log_test("AI chat (follow-up message)", False, f"Status: {status}, Data: {data}")
            
        # Test 24: GET /api/ai/chat/test-session-1 (chat history)
        success, data, status = self.make_request('GET', 'ai/chat/test-session-1')
        if success and 'messages' in data:
            messages = data['messages']
            if len(messages) == 4:  # 2 user + 2 assistant messages
                user_msgs = [m for m in messages if m.get('role') == 'user']
                assistant_msgs = [m for m in messages if m.get('role') == 'assistant']
                if len(user_msgs) == 2 and len(assistant_msgs) == 2:
                    self.log_test("AI chat history", True, f"4 messages in correct order")
                else:
                    self.log_test("AI chat history", False, f"Wrong message roles: {len(user_msgs)} user, {len(assistant_msgs)} assistant")
            else:
                self.log_test("AI chat history", False, f"Expected 4 messages, got: {len(messages)}")
        else:
            self.log_test("AI chat history", False, f"Status: {status}, Data: {data}")
            
        # Test 25: POST /api/ai/compare (valid comparison)
        compare_data = {
            "craftIds": ["majuli-masks", "monpa-masks"]
        }
        success, data, status = self.make_request('POST', 'ai/compare', compare_data)
        if success and 'comparison' in data:
            comparison = data['comparison']
            if len(comparison) > 50:  # Should be substantial comparison
                self.log_test("AI comparison (valid)", True, f"Comparison length: {len(comparison)} chars")
            else:
                self.log_test("AI comparison (valid)", False, f"Comparison too short: {len(comparison)} chars")
        else:
            self.log_test("AI comparison (valid)", False, f"Status: {status}, Data: {data}")
            
        # Test 26: POST /api/ai/compare (single ID - should fail)
        compare_data_invalid = {
            "craftIds": ["majuli-masks"]
        }
        success, data, status = self.make_request('POST', 'ai/compare', compare_data_invalid, expect_status=400)
        if success and status == 400:
            self.log_test("AI comparison (single ID - 400)", True, "Correctly returned 400 for single craft")
        else:
            self.log_test("AI comparison (single ID - 400)", False, f"Expected 400, got status: {status}")

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Northeast India Handicrafts Museum Backend Tests")
        print(f"📍 Testing against: {BASE_URL}")
        print("=" * 80)
        
        try:
            # Basic endpoints
            self.test_health_endpoint()
            self.test_meta_endpoint()
            
            # Crafts endpoints
            self.test_crafts_endpoints()
            
            # Auth endpoints
            self.test_auth_endpoints()
            
            # Admin CRUD
            self.test_crafts_crud_admin()
            
            # AI endpoints
            self.test_ai_endpoints()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            self.log_test("Test execution", False, f"Critical error: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for r in self.test_results if r['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print(f"\n🎯 Overall Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)