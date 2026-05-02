'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit3, Trash2, Save, X, Shield } from 'lucide-react';
import { toast } from 'sonner';

const BLANK = {
  id: '', name: '', state: 'Assam', category: 'Weaving',
  shortDescription: '', description: '',
  materials: [], technique: '', motifs: [],
  colors: '', culturalSignificance: '', threats: '',
  neighbouringInfluence: '', artisanCommunity: '',
  images: [], youtubeQuery: '',
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [crafts, setCrafts] = useState([]);
  const [meta, setMeta] = useState({ states: [], categories: [] });
  const [editing, setEditing] = useState(null); // craft object or 'new'
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  const reload = async () => {
    const r = await fetch('/api/crafts'); const d = await r.json(); setCrafts(d.crafts || []);
  };
  useEffect(() => {
    reload();
    fetch('/api/meta').then((r) => r.json()).then(setMeta);
  }, []);

  const startEdit = (c) => { setEditing(c); setForm({ ...BLANK, ...c, materials: c.materials || [], motifs: c.motifs || [], images: c.images || [] }); };
  const startNew = () => { setEditing('new'); setForm(BLANK); };
  const cancel = () => { setEditing(null); setForm(BLANK); };

  const save = async () => {
    try {
      let r;
      if (editing === 'new') {
        r = await fetch('/api/crafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
      } else {
        r = await fetch(`/api/crafts/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(editing === 'new' ? 'Craft created' : 'Craft updated');
      cancel(); reload();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const r = await fetch(`/api/crafts/${c.id}`, { method: 'DELETE', credentials: 'include' });
    if (r.ok) { toast.success('Deleted'); reload(); }
    else toast.error('Could not delete');
  };

  if (loading || !user) return <div className="max-w-7xl mx-auto px-6 py-20 text-stone-500">Loading…</div>;
  if (user.role !== 'admin') return <div className="max-w-7xl mx-auto px-6 py-20">Forbidden.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-1 inline-flex items-center gap-2"><Shield className="w-3 h-3" /> Admin panel</div>
          <h1 className="font-serif text-4xl">Curate the museum</h1>
        </div>
        <Button onClick={startNew}><Plus className="w-4 h-4 mr-1" /> New craft</Button>
      </div>

      {editing && (
        <div className="mb-10 rounded-2xl border-2 border-primary/30 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl">{editing === 'new' ? 'New craft' : `Edit — ${form.name}`}</h2>
            <div className="flex gap-2"><Button variant="outline" onClick={cancel}><X className="w-4 h-4 mr-1" /> Cancel</Button><Button onClick={save}><Save className="w-4 h-4 mr-1" /> Save</Button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ID (slug)"><Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={editing !== 'new'} placeholder="e.g. majuli-masks" /></Field>
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="State">
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full h-10 px-3 rounded-md border border-stone-300 bg-white">
                {(meta.states || []).map((s) => <option key={s.name}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-md border border-stone-300 bg-white">
                {(meta.categories || []).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Short description" full><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></Field>
            <Field label="Full description" full><textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-stone-300 bg-white" /></Field>
            <Field label="Materials (comma-separated)" full><Input value={(form.materials || []).join(', ')} onChange={(e) => setForm({ ...form, materials: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Technique" full><Input value={form.technique} onChange={(e) => setForm({ ...form, technique: e.target.value })} /></Field>
            <Field label="Motifs (comma-separated)" full><Input value={(form.motifs || []).join(', ')} onChange={(e) => setForm({ ...form, motifs: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Colours & meaning" full><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></Field>
            <Field label="Cultural significance" full><Input value={form.culturalSignificance} onChange={(e) => setForm({ ...form, culturalSignificance: e.target.value })} /></Field>
            <Field label="Threats" full><Input value={form.threats} onChange={(e) => setForm({ ...form, threats: e.target.value })} /></Field>
            <Field label="Cross-border influence" full><Input value={form.neighbouringInfluence} onChange={(e) => setForm({ ...form, neighbouringInfluence: e.target.value })} /></Field>
            <Field label="Artisan community" full><Input value={form.artisanCommunity} onChange={(e) => setForm({ ...form, artisanCommunity: e.target.value })} /></Field>
            <Field label="Images URLs (one per line)" full><textarea rows={4} value={(form.images || []).join('\n')} onChange={(e) => setForm({ ...form, images: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-md border border-stone-300 bg-white" /></Field>
            <Field label="YouTube search query" full><Input value={form.youtubeQuery} onChange={(e) => setForm({ ...form, youtubeQuery: e.target.value })} /></Field>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-600 text-xs uppercase tracking-wider">
            <tr><th className="text-left px-4 py-3">Image</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">State</th><th className="text-left px-4 py-3">Category</th><th className="text-right px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {crafts.map((c) => (
              <tr key={c.id} className="border-t border-stone-200 hover:bg-stone-50">
                <td className="px-4 py-3"><img src={c.images?.[0]} alt="" className="w-12 h-12 rounded object-cover" /></td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.state}</td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(c)}><Edit3 className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => remove(c)} className="text-red-700 border-red-200 hover:bg-red-50"><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="text-xs uppercase tracking-wider text-stone-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
