export default function PortalAccessSummary({ portals }: { portals: string[] }) {
  const selected = [{ id: 'aif', title: 'AI First' }, { id: 'idl', title: 'IDL' }, { id: 'sinad', title: 'SinaD' }].filter(portal => portals.includes(portal.id));
  return <div className="flex flex-wrap gap-2" aria-label="Portal yang dipilih">
    {selected.length ? selected.map(portal => <span key={portal.id} className="inline-flex rounded-md border border-[#00AACC]/25 bg-[#00AACC]/10 px-2.5 py-1 font-body text-xs font-bold text-[#001E3C] whitespace-nowrap">{portal.title}</span>) : <span className="font-body text-sm text-[#6A6A6A]">Belum ada portal dipilih</span>}
  </div>;
}
