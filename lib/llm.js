const BASE_URL = process.env.EMERGENT_LLM_BASE_URL || 'https://integrations.emergentagent.com/llm';
const API_KEY = process.env.EMERGENT_LLM_KEY;

export async function chatComplete({ messages, model = 'gpt-4o', temperature = 0.7, max_tokens = 800 }) {
  if (!API_KEY) {
    console.warn('EMERGENT_LLM_KEY not configured, using static fallback for AI');
    const sys = messages.find(m => m.role === 'system')?.content || '';
    if (sys.includes('JSON')) {
      return `{"name": "Offline Mode", "shortDescription": "LLM Key Missing", "description": "Please configure EMERGENT_LLM_KEY in Vercel to enable translation.", "culturalSignificance": ""}`;
    }
    return "The AD-4 Research project AI is currently offline. Please add the EMERGENT_LLM_KEY to your Vercel Environment Variables to enable live responses.";
  }
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LLM error ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
