'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await login(email, pw);
      router.push('/');
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-[0.25em] mb-2"><Sparkles className="w-3 h-3" /> Welcome back</div>
        <h1 className="font-serif text-3xl mb-6">Sign in to the museum</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-stone-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-stone-600">Password</label>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required className="mt-1" />
          </div>
          {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <div className="mt-4 text-sm text-stone-600">No account? <Link href="/register" className="text-primary font-medium">Create one</Link></div>
        <div className="mt-6 text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-md p-3">
          Admin demo: <code>admin@necrafts.in</code> / <code>admin123</code>
        </div>
      </div>
    </div>
  );
}
