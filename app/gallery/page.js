'use client';

import { useEffect, useMemo, useState } from 'react';
import CraftCard from '@/components/CraftCard';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function GalleryPage() {
  const [crafts, setCrafts] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState('All');
  const [category, setCategory] = useState('All');
  const [q, setQ] = useState('');

  // Read URL params on client mount only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('state')) setState(sp.get('state'));
    if (sp.get('category')) setCategory(sp.get('category'));
  }, []);

  useEffect(() => {
    fetch('/api/meta').then((r) => r.json()).then((d) => { setStates(d.states || []); setCategories(d.categories || []); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (state !== 'All') params.set('state', state);
    if (category !== 'All') params.set('category', category);
    if (q) params.set('q', q);
    fetch('/api/crafts?' + params.toString()).then((r) => r.json()).then((d) => setCrafts(d.crafts || []));
  }, [state, category, q]);

  const grouped = useMemo(() => {
    const m = {};
    for (const c of crafts) { (m[c.state] = m[c.state] || []).push(c); }
    return m;
  }, [crafts]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">The full gallery</div>
        <h1 className="font-serif text-5xl mb-3">Walk every loom</h1>
        <p className="text-stone-600 max-w-2xl">Browse all crafts from the eight states. Filter by state, by category, or search by a word.</p>
      </div>

      {/* Filters */}
      <div className="sticky top-[72px] z-20 bg-paper/95 backdrop-blur -mx-6 px-6 py-4 border-b border-stone-200 mb-8">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crafts, materials, motifs…" className="pl-9 h-11 bg-white" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={state} onChange={(e) => setState(e.target.value)} className="h-11 px-3 rounded-md border border-stone-300 bg-white text-sm">
              <option>All</option>
              {states.map((s) => (<option key={s.name}>{s.name}</option>))}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 px-3 rounded-md border border-stone-300 bg-white text-sm">
              <option>All</option>
              {categories.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </div>
        </div>
        <div className="mt-2 text-xs text-stone-500 flex items-center gap-2"><Filter className="w-3 h-3" /> {crafts.length} crafts</div>
      </div>

      {/* Crafts */}
      {state === 'All' ? (
        <div className="space-y-12">
          {Object.keys(grouped).sort().map((stateName) => (
            <div key={stateName}>
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-serif text-3xl">{stateName}</h2>
                <span className="text-stone-400 text-sm">{grouped[stateName].length} crafts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped[stateName].map((c, i) => (<CraftCard key={c.id} craft={c} index={i} />))}
              </div>
            </div>
          ))}
          {crafts.length === 0 && <div className="py-20 text-center text-stone-500">No crafts match these filters.</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crafts.map((c, i) => (<CraftCard key={c.id} craft={c} index={i} />))}
          {crafts.length === 0 && <div className="col-span-full py-20 text-center text-stone-500">No crafts match these filters.</div>}
        </div>
      )}
    </div>
  );
}
