'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Palette, Quote, MapPin, ArrowRight } from 'lucide-react';

export default function ContemporaryArtisansPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/api/contemporary-artisans').then((r) => r.json()).then((d) => setList(d.artisans || []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-museum text-amber-50">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1615485458925-5e263ab24c80?auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/60 to-stone-950/95" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/10 border border-amber-200/20 text-xs uppercase tracking-[0.25em] text-amber-200"><Palette className="w-3.5 h-3.5" /> Modern voices of heritage</div>
          <h1 className="font-serif text-5xl md:text-7xl mt-5 leading-[1] text-shadow-museum max-w-4xl">Contemporary Artisans</h1>
          <p className="mt-5 text-lg max-w-2xl text-amber-100/85 leading-relaxed">Meet the modern creators and visionaries who are reimagining Northeast Indian crafts for the present day, bringing ancient techniques into contemporary design.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((a, i) => (
          <motion.article
            key={a.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: (i % 6) * 0.05 }}
            className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm hover:shadow-xl transition-shadow flex flex-col md:flex-row"
          >
            <div className="md:w-2/5 h-56 md:h-auto relative overflow-hidden shrink-0">
              <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-3 left-4 right-4 md:hidden text-white">
                <div className="font-serif text-2xl text-shadow-museum">{a.name}</div>
                <div className="text-xs text-amber-200 uppercase tracking-widest">{a.years} years · {a.state}</div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              <div className="hidden md:block">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h2 className="font-serif text-2xl leading-tight">{a.name}</h2>
                  <span className="text-xs uppercase tracking-widest text-amber-700">{a.years} yrs</span>
                </div>
                <div className="text-xs text-stone-500 mb-3 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.village} · {a.state}</div>
              </div>
              <blockquote className="text-stone-700 italic text-[15px] leading-relaxed border-l-2 border-amber-400 pl-3 mb-3 flex gap-2">
                <Quote className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                <span>“{a.quote}”</span>
              </blockquote>
              <p className="text-sm text-stone-600 leading-relaxed">{a.bio}</p>
              {a.craft && (
                <Link href={`/craft/${a.craft.id}`} className="mt-4 inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:translate-x-0.5 transition-transform self-start">
                  Explore the craft · {a.craft.name} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {a.website && (
                <a href={a.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-amber-700 text-sm font-medium hover:translate-x-0.5 transition-transform self-start">
                  Visit Creator's Website <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
