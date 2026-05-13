'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, Layers, Search, Compass } from 'lucide-react';
import CraftCard from '@/components/CraftCard';
import NEMap from '@/components/NEMap';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [crafts, setCrafts] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.12]);

  useEffect(() => {
    fetch('/api/crafts').then((r) => r.json()).then((d) => setCrafts(d.crafts || []));
    fetch('/api/meta').then((r) => r.json()).then((d) => { setStates(d.states || []); setCategories(d.categories || []); });
  }, []);

  const featured = crafts.slice(0, 6);
  const byState = (s) => crafts.find((c) => c.state === s);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] overflow-hidden bg-museum text-amber-50">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
          <img src="https://images.unsplash.com/photo-1759738099669-d64b0656f6cf" alt="Northeast handicrafts" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/95" />
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/10 border border-amber-200/20 text-xs uppercase tracking-[0.25em] text-amber-200">
              <Sparkles className="w-3.5 h-3.5" /> NIFT Shillong Project heritage museum
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mt-6 leading-[0.95] text-shadow-museum max-w-5xl">
              Threads of the <span className="italic text-amber-300">Eight</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl text-amber-100/85 leading-relaxed">
              Step into the looms, kilns and carving sheds of <strong className="font-semibold text-amber-200">Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim and Tripura</strong>. Touch the patterns. Hear the stories. Ask anything.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/gallery"><Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold"><Search className="w-4 h-4 mr-2" /> Explore the Gallery</Button></Link>
              <Link href="/compare"><Button size="lg" variant="outline" className="bg-white/5 border-amber-200/30 text-amber-100 hover:bg-white/15"><Layers className="w-4 h-4 mr-2" /> Compare crafts</Button></Link>
            </div>
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {[
                { n: '8', l: 'States' },
                { n: '30+', l: 'Crafts' },
                { n: '5', l: 'Categories' },
                { n: '220', l: 'Languages' },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 backdrop-blur border border-amber-200/15 rounded-xl px-5 py-4">
                  <div className="font-serif text-3xl text-amber-200">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-amber-100/70">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATES STRIP - INTERACTIVE MAP */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">Begin a journey</div>
            <h2 className="font-serif text-4xl md:text-5xl">The eight sisters</h2>
            <p className="text-stone-600 mt-2 max-w-xl">Each state has its own loom, its own kiln, its own gods carved into wood. Tap any state on the map to walk into its gallery.</p>
          </div>
          <Link href="/gallery" className="text-primary font-medium inline-flex items-center gap-1">All crafts <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <NEMap />
      </section>

      {/* CATEGORIES */}
      <section className="bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-stone-500 mb-2"><Compass className="w-4 h-4" /> Wander by craft</div>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c} href={`/gallery?category=${encodeURIComponent(c)}`} className="px-5 py-2.5 rounded-full bg-white border border-stone-300 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">Curator's picks</div>
            <h2 className="font-serif text-4xl md:text-5xl">Featured masterpieces</h2>
          </div>
          <Link href="/gallery" className="text-primary font-medium inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((c, i) => (<CraftCard key={c.id} craft={c} index={i} />))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-rose-950 to-amber-900 text-amber-50 px-8 md:px-14 py-14">
          <div className="absolute inset-0 opacity-20"><img src="https://images.pexels.com/photos/28822805/pexels-photo-28822805.jpeg" alt="" className="w-full h-full object-cover" /></div>
          <div className="relative max-w-3xl">
            <Sparkles className="w-7 h-7 text-amber-300" />
            <h3 className="font-serif text-3xl md:text-5xl mt-3 leading-tight">Ask Dangoria, your museum guide</h3>
            <p className="mt-4 text-amber-100/85 text-lg leading-relaxed">Curious about Muga silk? Want to know why Naga shawls signal a Feast of Merit? Tap the chat bubble at the bottom right and start a conversation grounded in the museum&apos;s own corpus.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
