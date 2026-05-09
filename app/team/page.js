'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, GraduationCap } from 'lucide-react';

const TEAM = [
  {
    id: 'aabhipsita',
    name: 'Aabhipsita Chowdhury',
    role: 'Curatorial Lead',
    initials: 'AC',
    gradient: 'from-amber-700 via-rose-700 to-stone-800',
    image: 'https://pps.services.adobe.com/api/profile/8D2C229F687531300A495E83@AdobeID/image/99ca116e-92c1-4d94-a614-3965ba4ff0ee/276',
    note: 'Anchored the editorial voice of the museum and the structure of each craft entry — from materials to motifs to threats.',
  },
  {
    id: 'abhijith',
    name: 'Abhijith Anoop',
    role: 'Interaction & Interface Design',
    initials: 'AA',
    gradient: 'from-emerald-700 via-cyan-700 to-stone-800',
    image: 'https://pps.services.adobe.com/api/profile/625720BB631B02650A495C24@AdobeID/image/96c38441-74a2-415d-acea-5ae2b1fb58ba/276',
    note: 'Shaped the visitor journey — the hero, the gallery filters, the timeline\'s alternating bands and the in-page chat sidebar.',
  },
  {
    id: 'adeleen',
    name: 'Adeleen Warbah',
    role: 'Cultural Research & Northeast Liaison',
    initials: 'AW',
    gradient: 'from-teal-700 via-emerald-700 to-stone-800',
    image: 'https://pps.services.adobe.com/api/profile/F048219668D23E580A495FF5@AdobeID/image/ab3a64aa-0d00-4e96-9414-fd9e0bb9f38f/276',
    note: 'Brought deep regional grounding to Khasi, Garo and Mizo material — and to the cross-border influences threaded through every entry.',
  },
  {
    id: 'Geetmala',
    name: 'Geetmala Kalita',
    role: 'Visual & Pattern Research',
    initials: 'GK',
    gradient: 'from-rose-700 via-purple-700 to-stone-800',
    image: 'https://mir-s3-cdn-cf.behance.net/user/276/5b316c1364629831.69f4fb0e03313.jpg',
    note: 'Curated the visual language — image selection, the "Patterns and texture studies" galleries and the museum\'s colour palette.',
  },
  {
    id: 'pratyushpal',
    name: 'Pratyushpal Borah',
    role: 'Editorial & Documentation',
    initials: 'PB',
    gradient: 'from-orange-700 via-amber-700 to-stone-800',
    image: 'https://pps.services.adobe.com/api/profile/19E71E0B66FCEA140A495FEF@AdobeID/image/9536c116-af8a-4b79-93eb-64ee39dff203/276',
    note: 'Wrote and refined the long-form descriptions, technique notes and historical timelines that anchor every craft.',
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-museum text-amber-50">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/28822805/pexels-photo-28822805.jpeg" alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/65 to-stone-950/95" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/10 border border-amber-200/20 text-xs uppercase tracking-[0.25em] text-amber-200">
            <GraduationCap className="w-3.5 h-3.5" /> A NIFT student project
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mt-5 leading-[1] text-shadow-museum max-w-4xl">The team behind the threads</h1>
          <p className="mt-5 text-lg max-w-2xl text-amber-100/85 leading-relaxed">
            Threads of the Eight was researched, written, designed and assembled by five students of the National Institute of Fashion Technology — one museum, eight states, thirty crafts.
          </p>
        </div>
      </section>

      {/* TEAM GRID */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className="rounded-2xl border border-stone-200 bg-white p-7 hover:shadow-xl transition-shadow"
            >
              {m.image ? (
                <img src={m.image} alt={m.name} className="w-20 h-20 rounded-full object-cover shadow-lg mb-5" />
              ) : (
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-amber-50 font-serif text-2xl shadow-lg mb-5`}>
                  {m.initials}
                </div>
              )}
              <h2 className="font-serif text-2xl leading-tight">{m.name}</h2>
              <div className="text-xs uppercase tracking-[0.2em] text-amber-700 mt-1.5">{m.role}</div>
              <p className="text-sm text-stone-600 leading-relaxed mt-4">{m.note}</p>
            </motion.article>
          ))}
        </div>

        {/* About the project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-stone-50 border border-amber-200/60 p-8 md:p-12"
        >
          <Sparkles className="w-8 h-8 text-amber-700" />
          <h2 className="font-serif text-3xl md:text-4xl mt-3 leading-tight">About this museum</h2>
          <div className="prose-museum mt-5 text-stone-700 leading-relaxed text-[16px] max-w-3xl">
            <p>
              Northeast India holds some of the densest concentrations of indigenous craft knowledge anywhere in the country — and yet the eight states are unevenly visible to the rest of the world. <em>Threads of the Eight</em> was conceived as a small, accurate, visually generous bridge: a museum-style exhibition that walks a visitor across the looms, kilns, carving sheds and beadwork stalls of Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim and Tripura.
            </p>
            <p>
              Each entry is grounded in published research and editorial writing, illustrated with curated images and documentary video, and made interactive with a museum-trained , multi-language reading and a comparative-analysis tool. The work continues — and feedback from artisans, scholars and visitors is welcome.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/gallery" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-amber-50 text-sm font-medium hover:bg-stone-800 transition-colors">
              Walk the gallery <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/timeline" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-stone-300 text-stone-900 text-sm font-medium hover:border-stone-400 transition-colors">
              See the timeline <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
