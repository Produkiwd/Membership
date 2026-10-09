import { useEffect, useState, type FormEvent } from 'react';
import { AccessDialog } from './LocalMemberAccessRow';
import LocalNewMemberTier from './LocalNewMemberTier';
import GroupBatchPicker from './GroupBatchPicker';
import PortalAccessSummary from './PortalAccessSummary';
import { effectiveConfig, type MemberAccessConfig } from '../lib/memberAccessConfig';
import { addMemberGroup, createMemberWithAccess, listMemberCatalog, saveMemberAccess, sendMemberPasswordReset, type MemberRecord } from '../lib/membership';
import { filterMembers } from '../lib/memberSearch';
import { memberStatusLabel } from '../lib/memberStatus';

const emptyAccess = (): MemberAccessConfig => ({ tiers: [], aif: [], howTo: [], role: 'member', sinadRole: 'Student', expiry: '', portals: ['aif'], sinadMateri: false, sinadExercise: false });
const errorText = (error: unknown) => error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Gagal menyimpan. Silakan coba lagi.';
const inputClass = 'w-full h-11 rounded-lg border border-[#001E3C]/20 bg-white px-3 font-body text-sm text-[#001E3C] focus:outline-none focus:ring-2 focus:ring-[#00AACC] disabled:opacity-50';
const buttonClass = 'rounded-lg bg-[#001E3C] text-[#F7F9FC] font-body text-sm font-bold px-4 py-2.5 disabled:opacity-50';

function DatabaseMemberRow({ member, groups, ready, now, onSave, onAddGroup }: { key?: string; member: MemberRecord; groups: string[]; ready: boolean; now: number; onSave: (member: MemberRecord, config: MemberAccessConfig, group: string) => Promise<void>; onAddGroup: (name: string) => Promise<string> }) {
  const [config, setConfig] = useState(member.accessConfig || emptyAccess());
  const [group, setGroup] = useState(member.group || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { setConfig(member.accessConfig || emptyAccess()); setGroup(member.group || ''); }, [member.updatedAt]);
  const dirty = JSON.stringify(config) !== JSON.stringify(member.accessConfig) || group !== (member.group || '');
  const save = async (next = config) => {
    setBusy(true); setError(''); setMessage('');
    try {
      if (!ready) throw new Error('Penyimpanan baru belum aktif di database. Perlu penerapan migrasi dahulu.');
      await onSave(member, next, group); setConfig(effectiveConfig(next)); setMessage('Tersimpan di database.');
    } catch (err) { setError(errorText(err)); throw err; }
    finally { setBusy(false); }
  };
  const reset = async () => {
    setBusy(true); setError(''); setMessage('');
    try { await sendMemberPasswordReset(member.email); setMessage('Email reset sandi terkirim.'); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };
  const effective = effectiveConfig(config);
  const cell = 'py-5 px-4 align-top font-body text-sm leading-relaxed text-[#001E3C]';
  return <tr className="border-b border-[#001E3C]/10 hover:bg-[#F7F9FC]/70">
    <td className={cell}><p className="font-bold break-words">{member.name || 'Member'}</p><p className="text-xs text-[#6A6A6A] break-all mt-1">{member.email}</p></td>
    <td className={cell}><GroupBatchPicker value={group} groups={groups} disabled={busy || !ready} onChange={setGroup} onCreate={onAddGroup} label={`Grup atau batch ${member.name || 'member'}`} /></td>
    <td className={cell}>{effective.role === 'admin' ? 'Admin' : 'Member'}</td>
    <td className={cell}><PortalAccessSummary portals={effective.portals} /></td>
    <td className={cell}><div className="flex flex-wrap gap-1.5">{effective.tiers.map(tier => <span key={tier} className="rounded-full bg-[#001E3C] px-2.5 py-1 text-xs text-[#F7F9FC]">{tier}</span>)}</div>{!effective.tiers.length && <span>Belum diatur</span>}{dirty && <p className="text-xs text-[#005287] mt-2">Belum disimpan</p>}</td>
    <td className={cell}><input type="date" className={inputClass + ' min-w-[150px]'} aria-label={`Atur waktu akun ${member.name || 'member'}`} value={config.expiry} disabled={busy || !ready} onChange={e => { setConfig({ ...config, expiry: e.target.value }); setMessage(''); }} /><p className="text-xs text-[#6A6A6A] mt-2">{config.expiry ? 'Hingga akhir tanggal, WIB' : 'Tanpa batas tanggal'}</p></td>
    <td className={cell}>{memberStatusLabel(member, now)}<p className="text-xs text-[#6A6A6A] mt-1">Data tersimpan</p></td>
    <td className={cell}><div className="flex flex-col gap-2"><button type="button" disabled={busy} onClick={() => setEditing(true)} className={buttonClass + ' whitespace-nowrap !bg-[#00AACC] !text-[#001E3C]'}>Atur Tier</button>{dirty && <button type="button" disabled={busy || !ready} onClick={() => { void save().catch(() => {}); }} className={buttonClass}>{busy ? 'Menyimpan…' : 'Simpan perubahan'}</button>}<button type="button" disabled={busy} onClick={reset} className="rounded-lg border border-[#FCB528] px-3 py-2 font-body text-xs font-bold text-[#001E3C] disabled:opacity-50">Reset sandi</button></div>{error && <p role="alert" className="text-xs text-red-700 mt-2">{error}</p>}{message && <p role="status" className="text-xs text-[#005287] mt-2">{message}</p>}</td>
    {editing && <AccessDialog member={member} initial={config} persistence="server" onClose={() => { if (!busy) setEditing(false); }} onSave={async next => { await save(next); setEditing(false); }} />}
  </tr>;
}

export default function MemberManagement() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [now, setNow] = useState(Date.now);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newConfig, setNewConfig] = useState(emptyAccess);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const reload = async () => {
    setLoading(true); setLoadError('');
    try { const catalog = await listMemberCatalog(); setMembers(catalog.members); setGroups(catalog.groups); setReady(catalog.ready); }
    catch { setLoadError('Daftar member belum dapat dimuat. Coba lagi.'); setReady(false); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); const timer = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(timer); }, []);
  const addGroup = async (name: string) => {
    if (!ready) throw new Error('Penyimpanan batch belum aktif.');
    const saved = await addMemberGroup(name);
    setGroups(prev => [...new Set([...prev, saved.name])]); return saved.name;
  };
  const save = async (member: MemberRecord, config: MemberAccessConfig, group: string) => {
    const saved = await saveMemberAccess(member, config, group);
    // Use the committed response. A failed refresh never disguises a successful write as failure.
    setMembers(prev => prev.map(m => m.id === saved.id ? saved : m));
    if (saved.group) setGroups(prev => [...new Set([...prev, saved.group!])]);
    window.dispatchEvent(new Event('membership-access-saved'));
  };
  const create = async (e: FormEvent) => {
    e.preventDefault(); setCreating(true); setCreateError(''); setCreateMessage('');
    try {
      if (!ready) throw new Error('Penyimpanan baru belum aktif.');
      if (password.length < 6) throw new Error('Password minimal 6 karakter.');
      if (members.some(m => m.email.toLowerCase() === email.trim().toLowerCase())) throw new Error('Email sudah terdaftar. Ubah melalui Daftar Member.');
      const result = await createMemberWithAccess(email, password, newConfig, newGroup);
      setMembers(prev => [result.member, ...prev]);
      setCreateMessage(result.authUserCreated ? 'Akun login dan akses member tersimpan di database.' : 'Akses member tersimpan. Akun login yang sudah ada tetap memakai sandi sebelumnya.');
      setEmail(''); setPassword(''); setNewGroup(''); setNewConfig(emptyAccess()); setQuery(''); setFilterGroup('');
    } catch (err) { setCreateError(errorText(err)); }
    finally { setCreating(false); }
  };
  const allGroups = [...new Set([...groups, ...members.map(m => m.group || '').filter(Boolean)])].sort((a,b) => a.localeCompare(b));
  const visible = filterMembers<MemberRecord>(members, query, filterGroup);
  return <main className="member-management max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-16 text-[#001E3C]">
    <h1 className="font-sans font-bold text-3xl md:text-[42px] mb-8">Kelola Member</h1>
    {!loading && !loadError && !ready && <div role="status" className="mb-6 rounded-xl border border-[#FCB528] bg-[#FCB528]/10 p-4 font-body text-sm">Daftar dibaca dari database. Penyimpanan tier baru menunggu penerapan migrasi yang disetujui. Anda bisa membuka Atur Tier untuk melihat pilihannya.</div>}
    <section className="bg-white border border-[#001E3C]/15 p-6 md:p-8 rounded-xl mb-8">
      <h2 className="font-sans text-xl font-bold mb-2">Tambah Member Baru</h2>
      <p className="font-body text-sm text-[#6A6A6A] mb-6">Atur tier, portal, kotak materi, dan masa berlaku melalui Atur Tier.</p>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 items-start">
        <label className="min-w-0 font-body text-sm font-bold">Email<input type="email" required value={email} disabled={creating} autoComplete="off" onChange={e => setEmail(e.target.value)} className={inputClass + ' mt-2'} /></label>
        <label className="min-w-0 font-body text-sm font-bold">Password<input type="password" required minLength={6} value={password} disabled={creating} autoComplete="new-password" onChange={e => setPassword(e.target.value)} className={inputClass + ' mt-2'} /></label>
        <div className="min-w-0"><p className="font-body text-sm font-bold mb-2">Tier</p><LocalNewMemberTier config={newConfig} email={email} disabled={creating} onChange={setNewConfig} />{newConfig.expiry && <p className="font-body text-xs mt-2">Berlaku sampai {newConfig.expiry}</p>}</div>
        <div className="min-w-0"><p className="font-body text-sm font-bold mb-2">Grup / Batch</p><GroupBatchPicker value={newGroup} groups={allGroups} disabled={creating || !ready} onChange={setNewGroup} onCreate={addGroup} /></div>
        <div className="min-w-0"><p className="font-body text-sm font-bold mb-2">Akses Portal</p><PortalAccessSummary portals={effectiveConfig(newConfig).portals} /><p className="font-body text-xs text-[#6A6A6A] mt-2">Pengaturan melalui Atur Tier.</p></div>
        <button type="submit" disabled={creating || !ready || loading} className={buttonClass + ' mt-7'}>{creating ? 'Membuat…' : 'Tambah Member'}</button>
      </form>
      {createError && <p role="alert" className="font-body text-sm text-red-700 mt-4">{createError}</p>}{createMessage && <p role="status" className="font-body text-sm text-[#005287] mt-4">{createMessage}</p>}
    </section>
    <section className="bg-white border border-[#001E3C]/15 p-6 md:p-8 rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between gap-5 mb-6"><div><h2 className="font-sans font-bold text-xl mb-2">Daftar Member</h2><p className="font-body text-sm text-[#6A6A6A]">Ubah pilihan, lalu simpan. Susunan kolom tetap sama.</p></div><div className="flex flex-wrap items-end gap-3"><label className="font-body text-sm font-bold">Cari member<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama atau email" className={inputClass + ' mt-1'} /></label><label className="font-body text-sm font-bold">Grup<select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className={inputClass + ' mt-1'}><option value="">Semua Grup</option>{allGroups.map(g => <option key={g}>{g}</option>)}</select></label><button type="button" disabled={loading} onClick={() => void reload()} className="font-body text-sm font-bold text-[#005287] h-11">Muat ulang</button></div></div>
      {!loading && !loadError && <p role="status" className="font-body text-sm text-[#6A6A6A] mb-4">Menampilkan {visible.length} dari {members.length} member.</p>}
      {(query || filterGroup) && <button type="button" onClick={() => { setQuery(''); setFilterGroup(''); }} className="font-body text-sm text-[#005287] mb-4">Reset pencarian dan filter</button>}
      <div className="overflow-x-auto"><table className="member-table w-full text-left"><thead><tr>{['Nama / email','Grup / Batch','Role','Akses Portal','Tier','Atur Waktu','Status / Sisa Waktu','Aksi'].map(title => <th key={title} className="font-body text-sm p-3 border-b border-[#001E3C]/15">{title}</th>)}</tr></thead><tbody>{(loading || loadError || !visible.length) && <tr><td colSpan={8} className="font-body text-sm text-[#6A6A6A] text-center p-6">{loading ? 'Memuat data…' : loadError || 'Tidak ada member yang sesuai.'}</td></tr>}{!loading && !loadError && visible.map(member => <DatabaseMemberRow key={member.id} member={member} groups={allGroups} now={now} ready={ready} onSave={save} onAddGroup={addGroup} />)}</tbody></table></div>
    </section>
  </main>;
}
