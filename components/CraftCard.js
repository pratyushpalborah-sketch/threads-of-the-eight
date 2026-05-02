'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function CraftCard({ craft, index = 0 }) {
  const img = craft.images?.[0] || 'https://images.unsplash.com/photo-1759738099669-d64b0656f6cf';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: (index % 9) * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link href={`/craft/${craft.id}`} className="craft-card group block rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
        <div className="relative h-64 overflow-hidden">
          <img src={img} alt={craft.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">{craft.category}</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-amber-100/90 text-xs mb-1">
              <MapPin className="w-3 h-3" /> <span className="tracking-wide">{craft.state}</span>
            </div>
            <h3 className="font-serif text-2xl leading-tight text-shadow-museum">{craft.name}</h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-stone-600 line-clamp-3">{craft.shortDescription}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(craft.materials || []).slice(0, 3).map((m) => (
              <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">{m}</span>
            ))}
          </div>
          <div className="mt-4 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Explore craft →
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
