'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NEMap({ onPick }) {
  const [states, setStates] = useState([]);
  const [hover, setHover] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/geography').then((r) => r.json()).then((d) => setStates(d.states || []));
  }, []);

  const go = (name) => {
    if (onPick) onPick(name);
    else router.push(`/gallery?state=${encodeURIComponent(name)}`);
  };

  // Tailwind from-X to-Y gradients mapped to SVG fills
  const gradId = (s) => 'g_' + s.name.replace(/\s+/g, '_');
  const gradStops = (s) => {
    const m = (s.color || 'from-stone-700 to-stone-900').match(/from-([a-z]+)-(\d+) to-([a-z]+)-(\d+)/);
    const palette = {
      amber: '#b45309', rose: '#9f1239', emerald: '#065f46', cyan: '#0e7490',
      purple: '#6b21a8', teal: '#0f766e', indigo: '#3730a3', violet: '#5b21b6',
      orange: '#9a3412', red: '#991b1b', sky: '#075985', fuchsia: '#86198f',
      stone: '#44403c',
    };
    return m ? [palette[m[1]] || '#92400e', palette[m[3]] || '#1c1917'] : ['#92400e', '#1c1917'];
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <svg viewBox="0 0 1000 720" className="w-full h-auto select-none" role="img" aria-label="Northeast India map">
        <defs>
          {states.map((s) => {
            const [a, b] = gradStops(s);
            return (
              <linearGradient key={s.name} id={gradId(s)} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor={a} />
                <stop offset="1" stopColor={b} />
              </linearGradient>
            );
          })}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Decorative rivers / compass */}
        <text x="930" y="40" fontFamily="Cormorant Garamond, serif" fontSize="22" fill="#a8a29e" textAnchor="end">N</text>
        <line x1="920" y1="45" x2="920" y2="75" stroke="#a8a29e" strokeWidth="1.5" />
        <polygon points="915,75 920,68 925,75" fill="#a8a29e" />
        {states.map((s, i) => {
          const isHover = hover === s.name;
          return (
            <motion.g
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              onMouseEnter={() => setHover(s.name)}
              onMouseLeave={() => setHover(null)}
              onClick={() => go(s.name)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={s.path}
                fill={`url(#${gradId(s)})`}
                stroke="#fef3c7"
                strokeWidth={isHover ? 3 : 1.5}
                opacity={isHover ? 1 : 0.88}
                style={{ transition: 'all 0.3s ease' }}
                filter={isHover ? 'url(#glow)' : undefined}
              />
              <text
                x={s.label.x}
                y={s.label.y}
                textAnchor="middle"
                fontFamily="Cormorant Garamond, serif"
                fontSize={isHover ? 26 : 22}
                fontWeight="600"
                fill="#fffbeb"
                style={{ pointerEvents: 'none', textShadow: '0 2px 8px rgba(0,0,0,.6)' }}
              >
                {s.name}
              </text>
              <text
                x={s.label.x}
                y={s.label.y + 22}
                textAnchor="middle"
                fontSize={11}
                fill="#fde68a"
                style={{ pointerEvents: 'none', letterSpacing: '0.18em' }}
              >
                {s.count} CRAFTS
              </text>
            </motion.g>
          );
        })}
      </svg>
      {hover && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 left-2 bg-white/95 backdrop-blur border border-stone-200 rounded-lg px-3 py-2 shadow text-sm pointer-events-none"
        >
          <div className="font-serif text-base text-stone-900">{hover}</div>
          <div className="text-xs text-stone-500">{states.find((s) => s.name === hover)?.tagline}</div>
        </motion.div>
      )}
    </div>
  );
}
