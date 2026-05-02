'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';

export default function TimelinePage() {
  const [bands, setBands] = useState([]);

  useEffect(() => {
    fetch('/api/timeline').then((r) => r.json()).then((d) => setBands(d.timeline || []));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2 inline-flex items-center gap-2"><Clock className="w-3 h-3" /> Through the centuries</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-4">A timeline of Northeast craft</h1>
        <p className="text-stone-600 max-w-2xl text-lg">From Neolithic potsherds to colonial-era silver, walk seven editorial eras that shaped the eight states’ hands.</p>
      </div>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-200 via-stone-300 to-stone-100" />
        <div className="space-y-16">
          {bands.map((b, idx) => (
            <motion.section
              key={b.era.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className={`absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${b.era.color} ring-4 ring-paper`} style={{ top: '14px' }} />
              <div className={`md:grid md:grid-cols-2 md:gap-12 ${idx % 2 === 0 ? '' : 'md:[&>*:first-child]:order-2'}`}>
                <div className={`pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${b.era.color} text-amber-50 text-xs uppercase tracking-[0.25em] mb-3`}>{b.era.rangeShort}</div>
                  <h2 className="font-serif text-3xl md:text-4xl mb-3">{b.era.label}</h2>
                  <p className="text-stone-600 leading-relaxed">{b.era.blurb}</p>
                  <div className="text-xs text-stone-500 mt-3">{b.era.range} · {b.crafts.length} craft{b.crafts.length === 1 ? '' : 's'}</div>
                </div>
                <div className={`pl-12 mt-6 md:mt-0 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {b.crafts.map((c) => (
                      <Link key={c.id} href={`/craft/${c.id}`} className="group flex gap-3 p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all">
                        <img src={c.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-700 mb-0.5">
                            <span>{formatCentury(c.century)}</span>
                            <span className="opacity-50">·</span>
                            <span>{c.state}</span>
                          </div>
                          <div className="font-medium text-sm group-hover:text-primary truncate">{c.name}</div>
                          <div className="text-xs text-stone-500 line-clamp-2 mt-0.5">{c.historyNote || c.shortDescription}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatCentury(c) {
  if (c == null) return '';
  if (c < 0) return `${Math.abs(c)} c. BCE`;
  return `${c} c. CE`;
}
