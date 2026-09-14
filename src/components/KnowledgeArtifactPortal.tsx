import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, LockKeyhole, LogOut, Maximize2, Minimize2 } from 'lucide-react';
import { getMyMemberProfile, signOutMember } from '../lib/membership';
import { supabase } from '../lib/supabase';

const artifacts = [
  { id: 'api-token-guide', title: 'LLM API, Token & Pricing Guide', group: 'Local AI, LLM & Token', file: 'llm-api-token-pricing-guide.html' },
  { id: 'konsumsi-resource-ai', title: 'Beyond Tokens: The Real Cost of AI', group: 'Local AI, LLM & Token', file: 'beyond-tokens-real-cost-of-ai.html' },
  { id: 'alat-agentic-ai', title: 'Agentic AI Tools', group: 'Agentic AI', file: '04-agentic-ai-tools.html' },
  { id: 'kapan-memakai-agentic-ai', title: 'Generative AI vs Agentic AI', group: 'Agentic AI', file: '05-generative-ai-vs-agentic-ai.html' },
  { id: 'batas-kemandirian-agentic-ai', title: 'Levels of AI Agent Autonomy', group: 'Agentic AI', file: '06-ai-agent-autonomy.html' },
  { id: 'panduan-claude', title: 'Thinking & Working with Claude', group: 'Psychology, Thinking & AI', file: 'thinking-and-working-with-claude.html' },
  { id: 'apt-assessment', title: 'APT Assessment Toolkit', group: 'Psychology, Thinking & AI', file: 'apt-assessment-toolkit.html' },
  { id: 'neraca-apt', title: 'Neraca APT: Audit Tontonan AI Anda', group: 'Psychology, Thinking & AI', file: 'neraca-apt-audit-tontonan-ai.html' },
  { id: 'ai-survey', title: 'AI Maturity Survey', group: 'AI Adoption, Leadership & Business', file: 'ai-maturity-survey.html' },
] as const;

type ArtifactId = (typeof artifacts)[number]['id'];

const activityBridge = `<script>(()=>{let last=0;const ping=()=>{const now=Date.now();if(now-last<5000)return;last=now;window.parent.postMessage({type:'sinau-member-artifact-activity'},'*')};['pointermove','pointerdown','keydown','wheel','scroll','touchstart'].forEach(type=>window.addEventListener(type,ping,{capture:true,passive:true}))})()</script>`;

export const isKnowledgeArtifactId = (id: string | null): id is ArtifactId =>
  artifacts.some((artifact) => artifact.id === id);

export default function KnowledgeArtifactPortal({ initialId }: { initialId: ArtifactId }) {
  const [selectedId, setSelectedId] = useState<ArtifactId>(initialId);
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [fullScreen, setFullScreen] = useState(false);
  const [privatePreviewHtml, setPrivatePreviewHtml] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selected = artifacts.find((artifact) => artifact.id === selectedId)!;

  useEffect(() => {
    let mounted = true;
    getMyMemberProfile().then((profile) => {
      if (!mounted) return;
      const blocked = (profile.status || '').toLowerCase() !== 'active';
      const expired = Boolean(profile.expiresAt && profile.expiresAt.toDate() <= new Date());
      setAccess(blocked || expired ? 'denied' : 'allowed');
    }).catch(() => {
      if (mounted) setAccess('denied');
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (access !== 'allowed') return;
    let active = true;
    setPrivatePreviewHtml(null);
    setPreviewError(false);
    supabase.storage.from('knowledge-artifacts').download(selected.file).then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setPreviewError(true);
        return;
      }
      const html = await data.text();
      if (!active) return;
      const bridgedHtml = /<\/body>/i.test(html)
        ? html.replace(/<\/body>/i, `${activityBridge}</body>`)
        : `${html}${activityBridge}`;
      setPrivatePreviewHtml(bridgedHtml);
    }).catch(() => {
      if (active) setPreviewError(true);
    });
    return () => { active = false; };
  }, [access, selected.file]);

  useEffect(() => {
    const handleArtifactActivity = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== 'sinau-member-artifact-activity') return;
      window.dispatchEvent(new Event('member-artifact-activity'));
    };
    window.addEventListener('message', handleArtifactActivity);
    return () => window.removeEventListener('message', handleArtifactActivity);
  }, []);

  useEffect(() => {
    if (!fullScreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullScreen(false);
    };
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', close);
    };
  }, [fullScreen]);

  const choose = (id: ArtifactId) => {
    setPrivatePreviewHtml(null);
    setPreviewError(false);
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('artifact', id);
    window.history.replaceState(null, '', url);
  };

  const handleLogout = async () => {
    setLogoutError(false);
    try {
      await signOutMember();
    } catch (error) {
      console.error('Gagal keluar dari portal member:', error);
      setLogoutError(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#001e3c] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#fcb528]">SinauTech · Portal Member</p>
            <h1 className="text-xl font-extrabold sm:text-2xl">Knowledge Artifact</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={`${import.meta.env.DEV ? 'http://127.0.0.1:3000' : 'https://sinau.tech'}/knowledge?artifact=${encodeURIComponent(selectedId)}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white/80 hover:border-[#fcb528] hover:text-[#fcb528]"><ArrowLeft size={15} /> Kembali ke Knowledge</a>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-[#fcb528]/50 px-4 py-2 text-xs font-bold text-[#fcb528] hover:bg-[#fcb528]/10"><LogOut size={15} /> Keluar</button>
          </div>
        </div>
        {logoutError && <p role="alert" className="mb-4 text-sm text-red-300">Gagal keluar. Periksa koneksi lalu coba lagi.</p>}

        {access === 'checking' ? (
          <div className="rounded-xl border border-white/15 p-8 text-center">Memeriksa akses member…</div>
        ) : access === 'denied' ? (
          <div className="rounded-xl border border-[#fcb528]/30 bg-[#fcb528]/10 p-8 text-center">
            <LockKeyhole className="mx-auto mb-3 text-[#fcb528]" />
            <h2 className="text-lg font-bold">Akses member belum dapat diverifikasi</h2>
            <p className="mt-2 text-sm text-white/70">Periksa status keanggotaan atau muat ulang setelah login kembali.</p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-white/65">Anda sudah masuk. Pilih artifact lain tanpa login ulang selama sesi aktif.</p>
            {import.meta.env.DEV && <p className="mb-5 rounded-xl border border-[#fcb528]/30 bg-[#fcb528]/10 px-4 py-3 text-xs text-[#fcb528]">Uji lokal: pratinjau diambil dari penyimpanan privat Supabase dengan sesi member yang aktif.</p>}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="rounded-xl border border-white/10 bg-[#072745] p-3 lg:hidden">
                <label htmlFor="knowledge-member-select" className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#fcb528]">Pilih artifact</label>
                <select id="knowledge-member-select" value={selectedId} onChange={(event) => choose(event.target.value as ArtifactId)} className="w-full rounded-lg border border-white/20 bg-[#001e3c] px-3 py-3 text-sm font-semibold text-white">
                  {artifacts.map((artifact) => <option key={artifact.id} value={artifact.id}>{artifact.title}</option>)}
                </select>
              </div>
              <nav className="hidden w-64 shrink-0 space-y-2 rounded-xl border border-white/10 bg-[#072745] p-3 lg:block" aria-label="Artifact member">
                {artifacts.map((artifact) => <button key={artifact.id} type="button" onClick={() => choose(artifact.id)} aria-current={selectedId === artifact.id ? 'page' : undefined} className={`flex w-full items-start gap-2 rounded-lg border px-3 py-3 text-left text-sm ${selectedId === artifact.id ? 'border-[#fcb528]/60 bg-[#fcb528]/10 text-white' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}><BookOpen className="mt-0.5 shrink-0 text-[#fcb528]" size={15} /><span><span className="block font-bold">{artifact.title}</span><span className="mt-1 block text-[10px] uppercase tracking-wide text-white/40">{artifact.group}</span></span></button>)}
              </nav>
              <section className={`${fullScreen ? 'fixed inset-0 z-[100] flex h-[100dvh] flex-col rounded-none' : 'min-w-0 flex-1 rounded-xl'} overflow-hidden border border-white/10 bg-[#072745]`} aria-label={`Pratinjau ${selected.title}`}>
                <div className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-4">
                  <h2 className="min-w-0 truncate text-sm font-bold">{selected.title}</h2>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => setFullScreen((value) => !value)} className="inline-flex items-center gap-1 rounded-full border border-[#fcb528]/40 px-3 py-1.5 text-[10px] font-bold uppercase text-[#fcb528]">{fullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{fullScreen ? 'Kembali' : 'Layar penuh'}</button>
                  </div>
                </div>
                {privatePreviewHtml ? <iframe ref={iframeRef} key={selected.id} srcDoc={privatePreviewHtml} title={selected.title} className={`block w-full border-0 bg-white ${fullScreen ? 'min-h-0 flex-1' : 'h-[min(70vh,680px)]'}`} sandbox="allow-scripts allow-forms allow-popups allow-downloads" /> : <div className="p-8 text-center text-sm text-white/70">{previewError ? 'Materi privat belum tersedia atau akses ditolak. Silakan hubungi pengelola.' : 'Menyiapkan materi privat…'}</div>}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
