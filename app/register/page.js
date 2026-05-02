'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await register(email, pw, name);
      router.push('/');
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-[0.25em] mb-2"><Sparkles className="w-3 h-3" /> Become a member</div>
        <h1 className="font-serif text-3xl mb-6">Join Threads of the Eight</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="text-sm text-stone-600">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" /></div>
          <div><label className="text-sm text-stone-600">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" /></div>
          <div><label className="text-sm text-stone-600">Password</label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} className="mt-1" /></div>
          {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating…' : 'Create account'}</Button>
        </form>
        <div className="mt-4 text-sm text-stone-600">Already a member? <Link href="/login" className="text-primary font-medium">Sign in</Link></div>
      </div>
    </div>
  );
}
