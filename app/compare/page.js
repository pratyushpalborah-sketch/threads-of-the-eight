'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparePage() {
  const [crafts, setCrafts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState('');
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/crafts').then((r) => r.json()).then((d) => setCrafts(d.crafts || []));
  }, []);

  const toggle = (c) => {
    setSelected((s) => {
      if (s.find((x) => x.id === c.id)) return s.filter((x) => x.id !== c.id);
      if (s.length >= 4) return s;
      return [...s, c];
    });
  };

  const compare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setComparison('');
    try {
      const r = await fetch('/api/ai/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ craftIds: selected.map((s) => s.id) }) });
      const d = await r.json();
      setComparison(d.comparison || d.error || '');
    } finally { setLoading(false); }
  };

  const filtered = crafts.filter((c) => !q || (c.name + c.state + c.category).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2 inline-flex items-center gap-2"><Layers className="w-3 h-3" /> Comparison atelier</div>
        <h1 className="font-serif text-5xl mb-3">Compare crafts side-by-side</h1>
        <p className="text-stone-600 max-w-2xl">Pick two to four crafts and let our AD-4 Research project draw out their shared roots, divergent techniques and unique cultural signatures.</p>
      </div>

      {/* Selected pile */}
      <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/50 p-5 min-h-[140px] flex flex-wrap gap-3 items-center mb-6">
        <AnimatePresence>
          {selected.length === 0 ? (
            <div className="text-stone-500 italic">Pick at least 2 crafts to compare…</div>
          ) : selected.map((s) => (
            <motion.div key={s.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative group">
              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full pl-1 pr-4 py-1 shadow-sm">
                <img src={s.images?.[0]} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-stone-500">{s.state}</div>
                </div>
                <button onClick={() => toggle(s)} className="ml-1 w-6 h-6 rounded-full bg-stone-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-stone-500">{selected.length}/4 selected</span>
          <Button onClick={compare} disabled={selected.length < 2 || loading}><Sparkles className="w-4 h-4 mr-2" />{loading ? 'Comparing…' : 'Compare with AD-4 Research project'}</Button>
        </div>
      </div>

      {/* Comparison output */}
      {comparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-rose-50 p-6 mb-10">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-amber-700" /><h2 className="font-serif text-2xl">Comparative analysis</h2></div>
          <div className="prose-museum whitespace-pre-wrap text-stone-800 leading-relaxed">{comparison}</div>
        </motion.div>
      )}

      {/* Picker */}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter crafts to add…" className="w-full mb-4 px-4 py-3 rounded-lg border border-stone-300 bg-white" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((c) => {
          const sel = selected.find((s) => s.id === c.id);
          return (
            <button key={c.id} onClick={() => toggle(c)} className={`relative h-36 rounded-xl overflow-hidden border-2 transition-all text-left ${sel ? 'border-primary scale-[1.02] shadow-lg' : 'border-transparent hover:border-stone-300'}`}>
              <img src={c.images?.[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="text-[10px] uppercase tracking-widest opacity-80">{c.state}</div>
                <div className="font-serif text-sm leading-tight">{c.name}</div>
              </div>
              {sel && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
