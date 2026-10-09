import { useState } from 'react';

export default function GroupBatchPicker({ value, groups, onChange, label = 'Grup atau batch', disabled = false, onCreate }: { value: string; groups: string[]; onChange: (value: string) => void; label?: string; disabled?: boolean; onCreate?: (name: string) => Promise<string> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const blocked = disabled || busy;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const choices = [...new Set([...groups, value].filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const add = async () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return;
    const existing = choices.find(item => item.toLocaleLowerCase() === clean.toLocaleLowerCase());
    setBusy(true); setError('');
    try { const value = onCreate ? await onCreate(existing || clean) : existing || clean; onChange(value); setAdding(false); setName(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Batch belum tersimpan. Coba lagi.'); }
    finally { setBusy(false); }
  };
  return <div>
    <select aria-label={label} disabled={blocked} value={value} onChange={event => onChange(event.target.value)} title={value || 'Pilih batch'} className="w-full h-10 min-w-0 rounded-lg border border-[#001E3C]/20 bg-white px-3 font-body text-sm text-[#001E3C] focus:outline-none focus:ring-2 focus:ring-[#00AACC]">
      <option value="">Pilih batch</option>{choices.map(choice => <option key={choice} value={choice}>{choice}</option>)}
    </select>
    {adding ? <div className="mt-3 space-y-2">
      <input type="text" autoFocus disabled={blocked} maxLength={120} aria-label="Nama batch baru" placeholder="Nama batch baru" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void add(); } if (event.key === 'Escape') { event.preventDefault(); setAdding(false); setName(''); } }} className="w-full min-w-0 rounded-lg border border-[#001E3C]/20 bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#00AACC]" />
      <div className="flex flex-wrap gap-2"><button type="button" disabled={blocked || !name.trim()} onClick={() => void add()} className="rounded-md bg-[#001E3C] px-3 py-1.5 font-body text-xs text-[#F7F9FC] disabled:opacity-50">{busy ? 'Menyimpan…' : 'Tambah'}</button><button type="button" onClick={() => { setAdding(false); setName(''); }} className="rounded-md border border-[#001E3C]/20 px-3 py-1.5 font-body text-xs">Batal</button></div>
    </div> : <button type="button" disabled={blocked} onClick={() => setAdding(true)} className="font-body text-xs font-bold text-[#005287] mt-2 hover:underline">+ Batch baru</button>}
    {error && <p role="alert" className="font-body text-xs text-red-700 mt-2">{error}</p>}
  </div>;
}
