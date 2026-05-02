'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getSession() {
  if (typeof window === 'undefined') return 'temp';
  let s = localStorage.getItem('ne_session');
  if (!s) {
    s = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('ne_session', s);
  }
  return s;
}

export default function AIChat({ craftId = null }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = typeof window !== 'undefined' ? getSession() : 'temp';
  const scroller = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (msgs.length > 0) return;
    fetch(`/api/ai/chat/${sessionId}`).then((r) => r.json()).then((d) => {
      if (d?.messages?.length) setMsgs(d.messages);
      else setMsgs([{ role: 'assistant', content: 'Namaskar! I am Dangoria, your guide to the eight states of Northeast India and their crafts. Ask me about Muga silk, Majuli masks, Naga shawls, Longpi pottery — or anything you see in the gallery.' }]);
    });
  }, [open]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMsgs((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, craftId }),
      });
      const d = await r.json();
      setMsgs((m) => [...m, { role: 'assistant', content: d.reply || d.error || '…' }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-stone-800 text-white flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[min(95vw,400px)] h-[min(75vh,600px)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-br from-amber-700 via-rose-700 to-stone-800 text-amber-50 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div className="font-serif text-lg leading-tight">Dangoria · Museum Curator</div>
              <div className="ml-auto text-[10px] uppercase tracking-widest opacity-80">AD-4 Research project Guide</div>
            </div>
            <div ref={scroller} className="flex-1 overflow-y-auto scroll-fade px-3 py-3 space-y-3 bg-stone-50">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3.5 py-2.5 max-w-[85%] text-sm rounded-2xl whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-white border border-stone-200 rounded-bl-sm'}`}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start"><div className="px-3.5 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm text-stone-500"><span className="shimmer inline-block px-2 py-0.5 rounded">Dangoria is thinking…</span></div></div>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-stone-200 bg-white flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a craft, state or technique…" className="flex-1 px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white" />
              <button disabled={loading || !input.trim()} className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
