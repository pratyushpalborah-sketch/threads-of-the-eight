'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images = [], open, index = 0, onClose, onIndex }) {
  const [i, setI] = useState(index);

  useEffect(() => { setI(index); }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setI((x) => (x + 1) % images.length);
      if (e.key === 'ArrowLeft') setI((x) => (x - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, images.length, onClose]);

  useEffect(() => { onIndex?.(i); }, [i, onIndex]);

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><X className="w-5 h-5" /></button>
        <button onClick={(e) => { e.stopPropagation(); setI((x) => (x - 1 + images.length) % images.length); }} className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={(e) => { e.stopPropagation(); setI((x) => (x + 1) % images.length); }} className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronRight className="w-6 h-6" /></button>
        <AnimatePresence mode="wait">
          <motion.img key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} src={images[i]} alt="" className="max-h-[88vh] max-w-[92vw] object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </AnimatePresence>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm tabular-nums">{i + 1} / {images.length}</div>
      </motion.div>
    </AnimatePresence>
  );
}
