import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongodb';
import {
  signToken,
  hashPassword,
  comparePassword,
  getCurrentUser,
  seedAdmin,
  COOKIE_NAME,
} from '@/lib/auth';
import { chatComplete } from '@/lib/llm';
import { CRAFTS_SEED, STATES, CATEGORIES } from '@/lib/data/crafts-seed';
import { CRAFT_VIDEOS, SUPPORTED_LANGS } from '@/lib/data/extras';
import { ERAS, CRAFT_ERAS, ARTISANS, STATE_GEOMETRY } from '@/lib/data/timeline';

const ALL_STATIC_CRAFTS = CRAFTS_SEED.map((c) => ({
  ...c,
  videoIds: CRAFT_VIDEOS[c.id] || [],
  ...(CRAFT_ERAS[c.id] || {}),
}));

// ----- helpers -----
const json = (data, init = {}) => NextResponse.json(data, init);
const err = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

let _seedRun = false;
let _videoMigrated = false;
let _eraMigrated = false;
async function ensureSeed() {
  const db = await getDb();
  if (!db) return;
  if (!_videoMigrated) {
    for (const [cid, videoIds] of Object.entries(CRAFT_VIDEOS)) {
      await db.collection('crafts').updateOne({ id: cid }, { $set: { videoIds } });
    }
    await db.collection('crafts').updateMany({ videoIds: { $exists: false } }, { $set: { videoIds: [] } });
    _videoMigrated = true;
  }
  if (!_eraMigrated) {
    for (const [cid, info] of Object.entries(CRAFT_ERAS)) {
      await db.collection('crafts').updateOne({ id: cid }, { $set: { eraId: info.eraId, century: info.century, historyNote: info.historyNote } });
    }
    _eraMigrated = true;
  }
  if (_seedRun) return;
  await seedAdmin();
  const count = await db.collection('crafts').countDocuments();
  if (count === 0) {
    await db.collection('crafts').insertMany(
      CRAFTS_SEED.map((c) => ({ ...c, videoIds: CRAFT_VIDEOS[c.id] || [], ...(CRAFT_ERAS[c.id] || {}), createdAt: new Date(), updatedAt: new Date() }))
    );
  }
  await db.collection('crafts').createIndex({ id: 1 }, { unique: true });
  await db.collection('crafts').createIndex({ state: 1, category: 1 });
  await db.collection('chat_messages').createIndex({ sessionId: 1, createdAt: 1 });
  _seedRun = true;
}

function buildCookie(token) {
  const days = 7;
  const maxAge = days * 24 * 60 * 60;
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

// ----- handler -----
async function handler(request, { params }) {
  await ensureSeed();
  const path = (params?.path || []).join('/');
  const method = request.method;

  try {
    // Health
    if (path === '' || path === 'health') {
      return json({ ok: true, name: 'NE Crafts API' });
    }

    // ---- AUTH ----
    if (path === 'auth/register' && method === 'POST') {
      const { email, password, name } = await request.json();
      if (!email || !password) return err('Email and password required');
      const db = await getDb();
      const lower = email.toLowerCase();
      const existing = await db.collection('users').findOne({ email: lower });
      if (existing) return err('Email already registered', 409);
      const hashed = await hashPassword(password);
      const user = {
        id: uuidv4(),
        email: lower,
        password: hashed,
        name: name || lower.split('@')[0],
        role: 'user',
        createdAt: new Date(),
      };
      await db.collection('users').insertOne(user);
      const token = signToken({ userId: user.id });
      const out = { id: user.id, email: user.email, name: user.name, role: user.role };
      const res = NextResponse.json({ user: out, token });
      res.headers.set('Set-Cookie', buildCookie(token));
      return res;
    }

    if (path === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json();
      if (!email || !password) return err('Email and password required');
      const db = await getDb();
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) return err('Invalid credentials', 401);
      const ok = await comparePassword(password, user.password);
      if (!ok) return err('Invalid credentials', 401);
      const token = signToken({ userId: user.id });
      const out = { id: user.id, email: user.email, name: user.name, role: user.role };
      const res = NextResponse.json({ user: out, token });
      res.headers.set('Set-Cookie', buildCookie(token));
      return res;
    }

    if (path === 'auth/logout' && method === 'POST') {
      const res = NextResponse.json({ ok: true });
      res.headers.set('Set-Cookie', clearCookie());
      return res;
    }

    if (path === 'auth/me' && method === 'GET') {
      const user = await getCurrentUser(request);
      if (!user) return err('Not authenticated', 401);
      return json({ user });
    }

    // ---- META ----
    if (path === 'meta' && method === 'GET') {
      return json({ states: STATES, categories: CATEGORIES, languages: SUPPORTED_LANGS, eras: ERAS });
    }

    // ---- GEOGRAPHY (state shapes for SVG map) ----
    if (path === 'geography' && method === 'GET') {
      const db = await getDb();
      let counts = [];
      if (db) {
        counts = await db.collection('crafts').aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]).toArray();
      } else {
        const countMap = {};
        ALL_STATIC_CRAFTS.forEach(c => { countMap[c.state] = (countMap[c.state] || 0) + 1; });
        counts = Object.entries(countMap).map(([state, count]) => ({ _id: state, count }));
      }
      const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
      const out = STATE_GEOMETRY.map((g) => {
        const meta = STATES.find((s) => s.name === g.name);
        return { ...g, count: map[g.name] || 0, color: meta?.color, tagline: meta?.tagline };
      });
      return json({ states: out });
    }

    // ---- TIMELINE ----
    if (path === 'timeline' && method === 'GET') {
      const db = await getDb();
      const all = db ? await db.collection('crafts').find({}, { projection: { _id: 0 } }).toArray() : ALL_STATIC_CRAFTS;
      const byEra = {};
      for (const era of ERAS) byEra[era.id] = { era, crafts: [] };
      for (const c of all) {
        const eid = c.eraId || 'tribal-continuum';
        if (byEra[eid]) byEra[eid].crafts.push(c);
      }
      // Sort each era's crafts by century ascending
      for (const k of Object.keys(byEra)) byEra[k].crafts.sort((a, b) => (a.century || 0) - (b.century || 0));
      const ordered = ERAS.map((era) => byEra[era.id]).filter((b) => b.crafts.length > 0);
      return json({ timeline: ordered });
    }

    // ---- ARTISANS ----
    if (path === 'artisans' && method === 'GET') {
      const db = await getDb();
      const all = db ? await db.collection('crafts').find({}, { projection: { _id: 0, id: 1, name: 1, state: 1, category: 1, images: 1 } }).toArray() : ALL_STATIC_CRAFTS;
      const cmap = Object.fromEntries(all.map((c) => [c.id, c]));
      const out = ARTISANS.map((a) => ({ ...a, craft: cmap[a.craftId] || null }));
      return json({ artisans: out });
    }

    // ---- CRAFTS ----
    if (path === 'crafts' && method === 'GET') {
      const url = new URL(request.url);
      const state = url.searchParams.get('state');
      const category = url.searchParams.get('category');
      const q = url.searchParams.get('q');
      const filter = {};
      if (state && state !== 'All') filter.state = state;
      if (category && category !== 'All') filter.category = category;
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { state: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ];
      }
      const db = await getDb();
      let items = [];
      if (db) {
        items = await db
          .collection('crafts')
          .find(filter, { projection: { _id: 0 } })
          .sort({ state: 1, name: 1 })
          .toArray();
      } else {
        items = ALL_STATIC_CRAFTS.filter(c => {
          if (state && state !== 'All' && c.state !== state) return false;
          if (category && category !== 'All' && c.category !== category) return false;
          if (q) {
            const ql = q.toLowerCase();
            return c.name.toLowerCase().includes(ql) || 
                   (c.shortDescription || '').toLowerCase().includes(ql) || 
                   (c.description || '').toLowerCase().includes(ql) || 
                   c.state.toLowerCase().includes(ql) || 
                   c.category.toLowerCase().includes(ql);
          }
          return true;
        });
        items.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
      }
      return json({ crafts: items, count: items.length });
    }

    if (path.startsWith('crafts/') && method === 'GET') {
      const id = path.split('/')[1];
      const db = await getDb();
      const c = db ? await db.collection('crafts').findOne({ id }, { projection: { _id: 0 } }) : ALL_STATIC_CRAFTS.find(x => x.id === id);
      if (!c) return err('Not found', 404);
      return json({ craft: c });
    }

    if (path === 'crafts' && method === 'POST') {
      const user = await getCurrentUser(request);
      if (!user || user.role !== 'admin') return err('Admin only', 403);
      const body = await request.json();
      if (!body.id || !body.name || !body.state || !body.category) return err('Missing fields');
      const db = await getDb();
      const exists = await db.collection('crafts').findOne({ id: body.id });
      if (exists) return err('Craft id exists', 409);
      const doc = { ...body, createdAt: new Date(), updatedAt: new Date() };
      await db.collection('crafts').insertOne(doc);
      return json({ craft: { ...doc, _id: undefined } });
    }

    if (path.startsWith('crafts/') && method === 'PUT') {
      const user = await getCurrentUser(request);
      if (!user || user.role !== 'admin') return err('Admin only', 403);
      const id = path.split('/')[1];
      const body = await request.json();
      delete body._id;
      delete body.id;
      const db = await getDb();
      await db.collection('crafts').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } });
      const c = await db.collection('crafts').findOne({ id }, { projection: { _id: 0 } });
      return json({ craft: c });
    }

    if (path.startsWith('crafts/') && method === 'DELETE') {
      const user = await getCurrentUser(request);
      if (!user || user.role !== 'admin') return err('Admin only', 403);
      const id = path.split('/')[1];
      const db = await getDb();
      await db.collection('crafts').deleteOne({ id });
      return json({ ok: true });
    }

    // ---- AI ----
    if (path === 'ai/summary' && method === 'POST') {
      const { craftId } = await request.json();
      const db = await getDb();
      const c = db ? await db.collection('crafts').findOne({ id: craftId }) : ALL_STATIC_CRAFTS.find(x => x.id === craftId);
      if (!c) return err('Craft not found', 404);
      // Try cached summary
      if (c.aiSummary) return json({ summary: c.aiSummary, cached: true });
      const prompt = `You are a museum curator writing an evocative, accurate 120-150 word summary for visitors. Craft: "${c.name}" from ${c.state}, India. Category: ${c.category}.\n\nSource notes:\n${c.description}\n\nMaterials: ${(c.materials||[]).join(', ')}.\nTechnique: ${c.technique}.\nMotifs: ${(c.motifs||[]).join(', ')}.\nColours: ${c.colors||''}.\nCultural significance: ${c.culturalSignificance||''}.\n\nWrite a single, museum-grade paragraph in plain prose. Avoid clichés. Do not invent facts. End with one sentence on why the craft matters today.`;
      const summary = await chatComplete({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You write concise, evocative museum-label prose for Indian heritage crafts. Be accurate; never invent facts.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 350,
      });
      if (db) {
        await db.collection('crafts').updateOne({ id: craftId }, { $set: { aiSummary: summary, aiSummaryAt: new Date() } });
      }
      return json({ summary, cached: false });
    }

    if (path === 'ai/translate' && method === 'POST') {
      const { craftId, lang } = await request.json();
      if (!craftId || !lang) return err('craftId and lang required');
      const supported = SUPPORTED_LANGS.find((l) => l.code === lang);
      if (!supported) return err('Unsupported language');
      const db = await getDb();
      const c = db ? await db.collection('crafts').findOne({ id: craftId }) : ALL_STATIC_CRAFTS.find(x => x.id === craftId);
      if (!c) return err('Craft not found', 404);
      if (lang === 'en') {
        return json({
          lang,
          name: c.name,
          shortDescription: c.shortDescription,
          description: c.description,
          culturalSignificance: c.culturalSignificance,
          cached: true,
        });
      }
      const cached = c.translations?.[lang];
      if (cached?.description) return json({ ...cached, lang, cached: true });
      const prompt = `Translate the following museum craft text into ${supported.label} (${supported.native}). Use the natural script of the language. Keep proper nouns (place names, communities, technique names) intact. Preserve tone — evocative, museum-grade.\n\nReturn STRICT JSON with these exact keys: name, shortDescription, description, culturalSignificance.\n\nSOURCE:\nName: ${c.name}\nShort: ${c.shortDescription}\nDescription: ${c.description}\nCultural significance: ${c.culturalSignificance || ''}`;
      const out = await chatComplete({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a careful museum translator. Output strict JSON only — no markdown, no commentary.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });
      let parsed;
      try {
        const cleaned = out.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/```$/i, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        return err('Translation parse failed: ' + e.message + ' :: ' + out.slice(0, 200), 502);
      }
      const stash = {
        name: parsed.name || c.name,
        shortDescription: parsed.shortDescription || '',
        description: parsed.description || '',
        culturalSignificance: parsed.culturalSignificance || '',
      };
      if (db) {
        await db.collection('crafts').updateOne({ id: craftId }, { $set: { [`translations.${lang}`]: { ...stash, translatedAt: new Date() } } });
      }
      return json({ ...stash, lang, cached: false });
    }

    if (path === 'ai/compare' && method === 'POST') {
      const { craftIds } = await request.json();
      if (!Array.isArray(craftIds) || craftIds.length < 2) return err('Send at least 2 craftIds');
      const db = await getDb();
      const list = db ? await db.collection('crafts').find({ id: { $in: craftIds } }).toArray() : ALL_STATIC_CRAFTS.filter(x => craftIds.includes(x.id));
      if (list.length < 2) return err('Crafts not found', 404);
      const lines = list
        .map(
          (c) =>
            `- ${c.name} (${c.state} | ${c.category}) — Materials: ${(c.materials||[]).join(', ')}; Technique: ${c.technique}; Motifs: ${(c.motifs||[]).join(', ')}; Significance: ${c.culturalSignificance||''}.`
        )
        .join('\n');
      const prompt = `Compare these Northeast Indian crafts. Highlight (a) shared roots and influences, (b) differences in materials/technique/motif vocabulary, (c) what each contributes uniquely. Use bullet points and a short closing paragraph. Be precise; no invented facts.\n\n${lines}`;
      const out = await chatComplete({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a thoughtful comparative-craft scholar.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 700,
      });
      return json({ comparison: out, crafts: list.map((c) => ({ id: c.id, name: c.name, state: c.state, category: c.category })) });
    }

    if (path === 'ai/chat' && method === 'POST') {
      const { sessionId, message, craftId } = await request.json();
      if (!sessionId || !message) return err('sessionId and message required');
      const db = await getDb();

      // Load craft context if provided
      let craftContext = '';
      if (craftId) {
        const c = db ? await db.collection('crafts').findOne({ id: craftId }) : ALL_STATIC_CRAFTS.find(x => x.id === craftId);
        if (c) {
          craftContext = `Currently focused craft: ${c.name} (${c.state}, ${c.category}).\nDescription: ${c.description}\nMaterials: ${(c.materials||[]).join(', ')}.\nTechnique: ${c.technique}.\nMotifs: ${(c.motifs||[]).join(', ')}.\nCultural significance: ${c.culturalSignificance||''}.`;
        }
      }

      // Load full corpus (compact) for grounding
      const all = db ? await db.collection('crafts').find({}, { projection: { _id: 0, id: 1, name: 1, state: 1, category: 1, shortDescription: 1, materials: 1, technique: 1, motifs: 1 } }).toArray() : ALL_STATIC_CRAFTS;
      const corpus = all
        .map((c) => `${c.name} (${c.state}, ${c.category}): ${c.shortDescription} Materials: ${(c.materials||[]).join('/')}. Technique: ${c.technique}.`)
        .join('\n');

      // Load history
      const history = db ? await db
        .collection('chat_messages')
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .limit(40)
        .toArray() : [];

      const messages = [
        {
          role: 'system',
          content:
            'You are "Dangoria", a friendly, knowledgeable assistant for a Traditional Handicrafts of Northeast India museum. ALWAYS ground your answers in the corpus below. Be concise, warm, and visual: when describing crafts, mention materials, technique, motifs and cultural meaning. If a question is outside Northeast Indian crafts, gently steer back. Never invent statistics. Use Indian English.',
        },
        { role: 'system', content: `Corpus (grounding):\n${corpus}` },
        ...(craftContext ? [{ role: 'system', content: craftContext }] : []),
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ];

      const reply = await chatComplete({ model: 'gpt-4o', messages, temperature: 0.6, max_tokens: 600 });
      const now = new Date();
      if (db) {
        await db.collection('chat_messages').insertMany([
          { id: uuidv4(), sessionId, role: 'user', content: message, createdAt: now },
          { id: uuidv4(), sessionId, role: 'assistant', content: reply, createdAt: new Date(now.getTime() + 1) },
        ]);
      }
      return json({ reply, sessionId });
    }

    if (path.startsWith('ai/chat/') && method === 'GET') {
      const sessionId = path.split('/')[2];
      const db = await getDb();
      const msgs = db ? await db
        .collection('chat_messages')
        .find({ sessionId }, { projection: { _id: 0 } })
        .sort({ createdAt: 1 })
        .toArray() : [];
      return json({ messages: msgs });
    }

    return err(`Not found: ${method} /api/${path}`, 404);
  } catch (e) {
    console.error('API error:', e);
    return err(e?.message || 'Server error', 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
