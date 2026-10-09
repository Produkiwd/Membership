import PortalAccessSummary from './PortalAccessSummary';
import GroupBatchPicker from './GroupBatchPicker';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MemberAccessPreview, { mapLegacyAccess, type LocalAccessConfig } from './MemberAccessPreview';
import { memberExpiryTime, memberStatusLabel } from '../lib/memberStatus';

type PreviewMember = { id: string; name?: string | null; email: string; tier?: string | null; role?: string | null; group?: string | null; allowedPortals?: string[] | null; expiresAt?: { toDate: () => Date } | null; status?: string | null; localAccess?: LocalAccessConfig };
export function AccessDialog({ member, initial, onSave, onClose, persistence = 'preview' }: { member: PreviewMember; initial: LocalAccessConfig; onSave: (config: LocalAccessConfig) => void | Promise<void>; persistence?: 'preview' | 'server' | 'form'; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return createPortal(<dialog ref={ref} onCancel={onClose} aria-label="Atur Tier" className="m-auto w-[calc(100%-2rem)] max-w-3xl h-[90dvh] max-h-[860px] overflow-hidden rounded-2xl p-0 bg-white shadow-2xl backdrop:bg-[#001E3C]/70">
    <MemberAccessPreview initial={initial} name={member.name || 'Member'} email={member.email} persistence={persistence} onSave={onSave} onCancel={onClose} />
  </dialog>, document.body);
}

export default function LocalMemberAccessRow({ member, now, allGroups = [], onGroupChange }: { key?: string; member: PreviewMember; now: number; allGroups?: string[]; onGroupChange?: (id: string, group: string) => void }) {
  const [draft, setDraft] = useState<LocalAccessConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [localGroup, setLocalGroup] = useState<string | null>(null);
  const group = onGroupChange ? (member.group || '') : (localGroup ?? member.group ?? '');
  const changeGroup = (value: string) => { setLocalGroup(value); onGroupChange?.(member.id, value); };

  const mapped = member.localAccess || mapLegacyAccess(member);
  const expiryTime = memberExpiryTime(member);
  if (!mapped.expiry && expiryTime !== null && Number.isFinite(expiryTime)) mapped.expiry = new Date(expiryTime).toISOString().slice(0, 10);
  const config = draft || mapped;
  const internal = config.tiers.includes('Internal');
  const effectivePortals = internal ? ['aif', 'idl', 'sinad'] : config.portals;
  const cell = 'py-5 px-4 align-top font-body text-sm leading-relaxed text-[#001E3C]';
  return <tr className="border-b border-border-light-subtle/50 hover:bg-[#F7F9FC]/70 transition-colors">
    <td className={cell}><p className="font-bold break-words">{member.name || 'Member'}</p><p className="text-xs text-[#6A6A6A] break-all mt-1">{member.email}</p></td>
    <td className={cell}>
      <GroupBatchPicker value={group} groups={allGroups} onChange={changeGroup} label={`Grup atau batch ${member.name || 'member'}`} />
      {(localGroup !== null) && <p className="text-xs text-[#005287] mt-2">Draft lokal</p>}
    </td>
    <td className={cell}>{config.role === 'admin' ? 'Admin' : 'Member'}</td>
    <td className={cell}>
      <PortalAccessSummary portals={effectivePortals} />
    </td>
    <td className={cell}><div className="flex flex-wrap gap-1.5">{config.tiers.map(tier => <span key={tier} className="rounded-full bg-[#001E3C] px-2.5 py-1 text-xs whitespace-nowrap text-[#F7F9FC]">{tier}</span>)}</div>{config.tiers.length === 0 && <span>Perlu dipetakan</span>}{draft && <p className="text-xs text-[#005287] mt-2">Draft lokal</p>}</td>
    <td className={cell}>
      <input type="date" aria-label={`Atur waktu akun ${member.name || 'member'}`} value={config.expiry} onChange={event => setDraft({ ...config, expiry: event.target.value })} className="block w-full min-w-[150px] h-10 border border-[#001E3C]/20 rounded-lg px-3 py-2 bg-white text-[#001E3C] focus:outline-none focus:ring-2 focus:ring-[#00AACC]" />
      <p className="text-xs text-[#6A6A6A] mt-2">{config.expiry ? 'Berlaku sampai tanggal ini' : 'Tanpa batas tanggal'}</p>
    </td>
    <td className={cell}>{memberStatusLabel(member, now)}<p className="text-xs text-[#6A6A6A] mt-1">Status akun di server</p></td>
    <td className={cell}><button type="button" onClick={() => setEditing(true)} className="bg-[#00AACC] text-[#001E3C] font-bold rounded-lg px-4 py-2.5 whitespace-nowrap min-h-10 hover:bg-[#005287] hover:text-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-[#001E3C] transition-colors">Atur Tier</button>
      {editing && <AccessDialog member={member} initial={config} onClose={() => setEditing(false)} onSave={next => { setDraft(next); setEditing(false); }} />}
    </td>
  </tr>;
}

const examples: PreviewMember[] = [
  { id: 'example-professional', name: 'Member Contoh A', email: 'member.a@example.com', tier: 'Professional', role: 'member', status: 'active', group: 'Batch Contoh', allowedPortals: ['aif'] },
  { id: 'example-twc', name: 'Member Contoh B', email: 'member.b@example.com', tier: 'TWC', role: 'member', status: 'active', group: 'Kelas Claude', allowedPortals: ['aif'] },
];
export function LocalMemberListPreview() {
  const [batchNames, setBatchNames] = useState<string[]>(examples.map(member => member.group || '').filter(Boolean));
  const [groupDrafts, setGroupDrafts] = useState<Record<string, string>>({});
  const changeGroup = (id: string, group: string) => { setGroupDrafts(previous => ({ ...previous, [id]: group })); if (group) setBatchNames(previous => [...new Set([...previous, group])]); };
  return <section className="member-management rounded-xl border border-[#001E3C]/15 bg-white p-6 md:p-8">
    <h1 className="font-sans text-2xl font-bold text-[#001E3C]">Daftar Member</h1>
    <p className="font-body text-[#6A6A6A] mt-2 mb-6">Contoh alur edit member. Klik Atur Tier. Draft tersimpan selama halaman ini terbuka dan direset saat dimuat ulang.</p>
    <div className="overflow-x-auto"><table className="member-table w-full text-left"><thead><tr>{['Nama / email', 'Grup / Batch', 'Role', 'Akses Portal', 'Tier', 'Atur Waktu', 'Status', 'Aksi'].map(title => <th key={title} className="font-body text-sm text-[#001E3C] p-2 border-b border-[#001E3C]/15">{title}</th>)}</tr></thead><tbody>{examples.map(member => <LocalMemberAccessRow key={member.id} member={{ ...member, group: groupDrafts[member.id] ?? member.group }} allGroups={batchNames} onGroupChange={changeGroup} now={Date.now()} />)}</tbody></table></div>
  </section>;
}
