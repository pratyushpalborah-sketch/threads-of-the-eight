'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Sparkles, Youtube, Send, Layers, Palette, Hammer, Users, AlertTriangle, Globe2, Languages, Maximize2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Lightbox from '@/components/Lightbox';

const LANGS = [
  { code: 'en', short: 'EN', native: 'English' },
  { code: 'hi', short: 'हिं', native: 'हिन्दी' },
  { code: 'as', short: 'অস', native: 'অসমীয়া' },
  { code: 'mni', short: 'মৈ', native: 'মৈতৈলোন্' },
  { code: 'bn', short: 'বাং', native: 'বাংলা' },
];

function sessionFor(id) {
  if (typeof window === 'undefined') return 'temp';
  const k = 'ne_craft_chat_' + id;
  let s = localStorage.getItem(k);
  if (!s) { s = 'craft_' + id + '_' + Math.random().toString(36).slice(2); localStorage.setItem(k, s); }
  return s;
}

export default function CraftDetail() {
  const { id } = useParams();
  const [craft, setCraft] = useState(null);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [related, setRelated] = useState([]);
  const [lang, setLang] = useState('en');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/crafts/${id}`).then((r) => r.json()).then((d) => setCraft(d.craft));
    fetch('/api/crafts').then((r) => r.json()).then((d) => setRelated(d.crafts || []));
  }, [id]);

  // Reset translation on lang/craft change
  useEffect(() => {
    if (!craft) return;
    if (lang === 'en') { setTranslation(null); return; }
    setTranslating(true);
    setTranslation(null);
    fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ craftId: craft.id, lang }) })
      .then((r) => r.json())
      .then((d) => { if (!d.error) setTranslation(d); })
      .finally(() => setTranslating(false));
  }, [lang, craft?.id]);

  const generateSummary = async () => {
    if (!craft) return;
    setSummaryLoading(true);
    try {
      const r = await fetch('/api/ai/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ craftId: craft.id }) });
      const d = await r.json();
      setSummary(d.summary || d.error || '');
    } finally { setSummaryLoading(false); }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading || !craft) return;
    const sessionId = sessionFor(craft.id);
    setChat((m) => [...m, { role: 'user', content: text }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const r = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, message: text, craftId: craft.id }) });
      const d = await r.json();
      setChat((m) => [...m, { role: 'assistant', content: d.reply || d.error || '…' }]);
    } catch {
      setChat((m) => [...m, { role: 'assistant', content: 'Sorry, please try again.' }]);
    } finally { setChatLoading(false); }
  };

  if (!craft) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-stone-500">Loading craft…</div>;
  }

  const sameState = related.filter((r) => r.state === craft.state && r.id !== craft.id).slice(0, 3);
  const sameCategory = related.filter((r) => r.category === craft.category && r.id !== craft.id).slice(0, 3);

  // Display values (translated or original)
  const dName = translation?.name || craft.name;
  const dShort = translation?.shortDescription || craft.shortDescription;
  const dDescription = translation?.description || craft.description;
  const dCultural = translation?.culturalSignificance || craft.culturalSignificance;

  return (
    <div className="pb-16">
      {/* HERO with parallax-ish zoom */}
      <section className="relative h-[78vh] overflow-hidden bg-stone-900 text-amber-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src={craft.images?.[active] || craft.images?.[0]}
            alt={craft.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/55 via-stone-950/35 to-stone-950/95" />
        <div className="relative max-w-6xl mx-auto h-full px-6 pt-10 pb-8 flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link href="/gallery" className="inline-flex items-center gap-1 text-amber-200/90 text-sm hover:text-amber-200"><ArrowLeft className="w-4 h-4" /> All crafts</Link>
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-amber-200/25 rounded-full p-1">
              <Languages className="w-4 h-4 text-amber-200 ml-2" />
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className={`px-2.5 py-1 rounded-full text-xs transition-all ${lang === l.code ? 'bg-amber-400 text-stone-900 font-semibold' : 'text-amber-100/90 hover:bg-white/10'}`} title={l.native}>
                  {l.short}
                </button>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mt-auto">
            <div className="flex items-center gap-3 text-amber-200/90 text-sm mb-3">
              <MapPin className="w-4 h-4" /> {craft.state}
              <span className="opacity-50">•</span>
              <span className="uppercase tracking-[0.2em] text-xs">{craft.category}</span>
              {translating && <span className="text-xs italic opacity-80 shimmer rounded px-2">translating…</span>}
            </div>
            <motion.h1 key={dName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-5xl md:text-7xl leading-[0.95] text-shadow-museum max-w-4xl">{dName}</motion.h1>
            <motion.p key={dShort} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 text-lg max-w-3xl text-amber-100/90">{dShort}</motion.p>
          </motion.div>
          <div className="mt-6 flex gap-2 overflow-x-auto scroll-fade pb-2">
            {(craft.images || []).map((img, i) => (
              <button key={i} onClick={() => setActive(i)} className={`shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${active === i ? 'border-amber-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <button onClick={() => { setLightboxOpen(true); }} className="shrink-0 w-24 h-16 rounded-md border-2 border-amber-200/30 text-amber-200 flex items-center justify-center gap-1 text-xs hover:bg-white/5"><Maximize2 className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      <Lightbox images={craft.images || []} open={lightboxOpen} index={active} onClose={() => setLightboxOpen(false)} onIndex={(i) => setActive(i)} />

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl mb-3">About this craft</h2>
            <div className="prose-museum text-stone-700 leading-relaxed text-[17px]"><p>{dDescription}</p></div>
          </motion.section>

          {/* Videos */}
          {(craft.videoIds && craft.videoIds.length > 0) ? (
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2"><Youtube className="w-5 h-5 text-red-600" /><h3 className="font-serif text-2xl">Watch this craft come alive</h3></div>
                <a target="_blank" rel="noopener" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(craft.youtubeQuery || craft.name)}`} className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1"><Youtube className="w-3 h-3" /> More on YouTube</a>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-stone-900">
                <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${craft.videoIds[activeVideo]}?rel=0`} title={craft.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              {craft.videoIds.length > 1 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {craft.videoIds.map((vid, i) => (
                    <button key={vid} onClick={() => setActiveVideo(i)} className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeVideo === i ? 'border-red-500 scale-[1.02]' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                      <img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white drop-shadow" fill="white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          ) : (craft.youtubeQuery && (
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3"><Youtube className="w-5 h-5 text-red-600" /><h3 className="font-serif text-2xl">Watch this craft</h3></div>
              <a target="_blank" rel="noopener" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(craft.youtubeQuery)}`}>
                <div className="relative h-56 md:h-72 rounded-xl overflow-hidden group cursor-pointer">
                  <img src={craft.images?.[1] || craft.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/30 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-9 h-9 ml-1" fill="currentColor"><polygon points="7,4 22,12 7,20" /></svg>
                    </div>
                  </div>
                </div>
              </a>
            </motion.section>
          ))}

          {/* AI Summary */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-rose-50 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-2xl">Curator&apos;s Summary</h3>
              </div>
              <Button size="sm" onClick={generateSummary} disabled={summaryLoading} variant="outline" className="border-amber-700/30">
                {summaryLoading ? 'Composing…' : (summary ? 'Regenerate' : 'Generate')}
              </Button>
            </div>
            {summary ? (
              <p className="text-stone-800 leading-relaxed">{summary}</p>
            ) : summaryLoading ? (
              <p className="text-stone-500 italic shimmer rounded">Composing a museum label…</p>
            ) : (
              <p className="text-stone-500 italic">Click &quot;Generate&quot; for a 120-150 word museum-grade summary, grounded in this craft&apos;s notes.</p>
            )}
          </motion.section>

          {/* Detail grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailBlock icon={Palette} title="Materials" items={craft.materials} />
            <DetailBlock icon={Hammer} title="Technique" body={craft.technique} />
            <DetailBlock icon={Layers} title="Motifs" items={craft.motifs} />
            <DetailBlock icon={Palette} title="Colours & meaning" body={craft.colors} />
            <DetailBlock icon={Users} title="Artisan community" body={craft.artisanCommunity} />
            <DetailBlock icon={Globe2} title="Cross-border influence" body={craft.neighbouringInfluence} />
            <DetailBlock icon={Sparkles} title="Cultural significance" body={dCultural} />
            <DetailBlock icon={AlertTriangle} title="Threats" body={craft.threats} variant="danger" />
          </section>

          {/* Patterns gallery */}
          {(craft.images?.length || 0) > 1 && (
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h3 className="font-serif text-2xl mb-4">Patterns &amp; texture studies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {craft.images.map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="aspect-square overflow-hidden rounded-xl group cursor-pointer relative" onClick={() => { setActive(i); setLightboxOpen(true); }}>
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 flex items-center justify-center transition-colors">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-[88px] self-start">
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-br from-amber-700 to-rose-800 text-amber-50">
              <div className="font-serif text-lg">Ask about this craft</div>
              <div className="text-xs opacity-80">Dangoria, grounded on this exhibit</div>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto scroll-fade space-y-2 bg-stone-50">
              {chat.length === 0 && (
                <div className="text-xs text-stone-500 px-2 py-1">Try: <em>&quot;Why are the colours specific?&quot;</em>, <em>&quot;Who weaves it?&quot;</em>, <em>&quot;How long does it take?&quot;</em></div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
                  <span className={`inline-block px-3 py-2 rounded-2xl whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border border-stone-200'}`}>{m.content}</span>
                </div>
              ))}
              {chatLoading && <div className="text-xs text-stone-500 italic">Thinking…</div>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="p-3 border-t border-stone-200 flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about this craft…" className="flex-1 px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40" disabled={chatLoading || !chatInput.trim()}><Send className="w-4 h-4" /></button>
            </form>
          </div>

          {sameState.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">More from {craft.state}</div>
              <div className="space-y-3">
                {sameState.map((r) => (
                  <Link key={r.id} href={`/craft/${r.id}`} className="flex gap-3 group">
                    <img src={r.images?.[0]} alt="" className="w-16 h-16 rounded-md object-cover" />
                    <div>
                      <div className="font-medium group-hover:text-primary text-sm">{r.name}</div>
                      <div className="text-xs text-stone-500">{r.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {sameCategory.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">More in {craft.category}</div>
              <div className="space-y-3">
                {sameCategory.map((r) => (
                  <Link key={r.id} href={`/craft/${r.id}`} className="flex gap-3 group">
                    <img src={r.images?.[0]} alt="" className="w-16 h-16 rounded-md object-cover" />
                    <div>
                      <div className="font-medium group-hover:text-primary text-sm">{r.name}</div>
                      <div className="text-xs text-stone-500">{r.state}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailBlock({ icon: Icon, title, body, items, variant }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`rounded-2xl border p-5 ${variant === 'danger' ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${variant === 'danger' ? 'text-red-700' : 'text-amber-700'}`} />
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500">{title}</div>
      </div>
      {items ? (
        <div className="flex flex-wrap gap-1.5">{items.map((m) => (<span key={m} className="text-sm px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">{m}</span>))}</div>
      ) : (
        <p className="text-stone-700 leading-relaxed text-sm">{body || '—'}</p>
      )}
    </motion.div>
  );
}
