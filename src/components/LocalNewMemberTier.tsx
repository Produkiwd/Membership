import { useState } from 'react';
import { AccessDialog } from './LocalMemberAccessRow';
import type { LocalAccessConfig } from './MemberAccessPreview';

export default function LocalNewMemberTier({ config, email, onChange, disabled = false }: { config: LocalAccessConfig; email: string; disabled?: boolean; onChange: (config: LocalAccessConfig) => void }) {
  const [open, setOpen] = useState(false);
  return <div>
    <div className="flex flex-wrap items-center gap-2 min-h-12 rounded-lg border border-[#001E3C]/20 bg-white px-3 py-2">
      {config.tiers.length ? config.tiers.map(tier => <span key={tier} className="rounded-full bg-[#001E3C] text-[#F7F9FC] font-body text-xs px-2.5 py-1">{tier}</span>) : <span className="font-body text-sm text-[#6A6A6A]">Belum diatur</span>}
      <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="ml-auto whitespace-nowrap rounded-md bg-[#00AACC] px-3 py-2 font-body text-sm font-bold text-[#001E3C]">Atur Tier</button>
    </div>
    <p className="font-body text-xs text-[#6A6A6A] mt-2">AIF · AIF How To · Internal · SinaD</p>
    {open && <AccessDialog member={{ id: 'new-member-draft', name: 'Member baru', email: email || 'Email belum diisi' }} initial={config} persistence="form" onClose={() => setOpen(false)} onSave={next => { onChange(next); setOpen(false); }} />}
  </div>;
}
