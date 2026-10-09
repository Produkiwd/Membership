import MemberManagement from './components/MemberManagement';
import type { MemberAccessConfig } from './lib/memberAccessConfig';
import { useDailySession } from './lib/useDailySession';
import { markDailySession } from './lib/dailySession';
import PortalAccessSummary from './components/PortalAccessSummary';
import GroupBatchPicker from './components/GroupBatchPicker';
import LocalNewMemberTier from './components/LocalNewMemberTier';
import type { LocalAccessConfig } from './components/MemberAccessPreview';
import LocalMemberAccessRow, { LocalMemberListPreview } from './components/LocalMemberAccessRow';
import { Monitor, Sparkles, BookOpen, Calendar, ChevronRight, ChevronLeft, FileText, Lock, LogOut, Video, Key, Maximize, Minimize, Eye, EyeOff, X, Trash2, ExternalLink } from 'lucide-react';
import { useState, useEffect, type ReactNode, type ButtonHTMLAttributes, type FormEvent, type ChangeEvent, type SyntheticEvent } from 'react';
import { cn } from './lib/utils';
import { filterMembers } from './lib/memberSearch';
import { memberExpiryTime, memberState, memberStatusLabel } from './lib/memberStatus';
import LoginVideoBackground from './components/LoginVideoBackground';
import { useArtifactProgress } from './lib/useArtifactProgress';
import { buildArtifactList, type LearningArtifact } from './lib/artifactProgress';
import { AI_OS_GROUP, AI_OS_TIER, canAccessAifModule, canAccessPromptStudio } from './lib/access';
import {
  createPendingMember,
  getCurrentUser,
  getMyMemberProfile,
  listMembers,
  onAuthUserChange,
  sendMemberPasswordReset,
  signInMember,
  signOutMember,
  updateMember,
  updateMemberPassword,
  type User,
  type MemberRecord,
} from './lib/membership';
import { addMateri, deleteMateri, getMateriByModule, uploadMateriFile, type Materi } from './lib/materi';
import aifPromptingHtml from '../materi/Prompt day1/aif-prompting-level2-day1.html?raw';
import aifReadingHtml from '../materi/Prompt day1/aif-reading-level2-day1.html?raw';
import aifPkmHtml from '../materi/Prompt day2/aif-pkm-level2-day2.html?raw';
import aifWritingHtml from '../materi/Prompt day2/aif-writing-level2-day2.html?raw';
import level3Day1Html from './Level 3/Level 3 day 1.html?raw';
import level3Day1_1Html from './Level 3/Level 3 day 1.1.html?raw';
import twcHtml1 from '../ThinkingWithClaude/setup.html?raw';
import twcHtml2 from '../ThinkingWithClaude/thinking.html?raw';
import aptAssessmentHtml from './Strategize/apt-assessment.html?raw';
import responsibleAiUntukPemimpinHtml from '../materi/Strategize/responsible-ai-untuk-pemimpin-v0.html?raw';
import petaUsecaseAi2026Html from '../materi/Strategize/peta-usecase-ai-2026-v0.html?raw';
import formatDataUntukAiHtml from '../materi/Strategize/Format-Data-untuk-AI-v0.html?raw';
import aifWithClaudeHtml from '../materi/Strategize/aif-with-claude-v0.html?raw';
import aiKnowledgeOperatingSystemHtml from '../materi/ACT/AI_Knowledge_Operating_System_v0.html?raw';
import SinadPortal from './components/SinadPortal';
import PromptDatabaseView from './components/PromptDatabaseView';
import KnowledgeArtifactPortal, { isKnowledgeArtifactId } from './components/KnowledgeArtifactPortal';

function keepEmbeddedHashNavigationInsideFrame(event: SyntheticEvent<HTMLIFrameElement>) {
  const document = event.currentTarget.contentDocument;
  if (!document || document.documentElement.dataset.hashNavigationBound === 'true') return;

  document.documentElement.dataset.hashNavigationBound = 'true';
  document.addEventListener('click', (clickEvent) => {
    const clickedElement = clickEvent.target as Element | null;
    const anchor = clickedElement?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    const hash = anchor?.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;

    clickEvent.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function Eyebrow({ children, variant = 'light' }: { children: ReactNode, variant?: 'light' | 'dark' | 'flat' }) {
  return (
    <span className={cn(
      "inline-block font-sans font-bold tracking-eyebrow uppercase px-4 py-1.5 rounded-full text-xs",
      variant === 'light' && "bg-bg-light-eyebrow border border-border-light-eyebrow text-gold-muted",
      variant === 'dark' && "bg-bg-dark-eyebrow border border-border-dark-eyebrow text-gold",
      variant === 'flat' && "text-gold-muted px-0"
    )}>
      {children}
    </span>
  );
}

function Button({ children, variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'tertiary' }) {
  return (
    <button className={cn(
      "font-sans font-bold uppercase tracking-eyebrow transition-all duration-300 rounded flex-shrink-0 cursor-pointer",
      "px-8 py-4 text-sm inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
      variant === 'primary' && "bg-[#00AACC] text-white hover:-translate-y-0.5 hover:shadow-card disabled:hover:translate-y-0",
      variant === 'secondary' && "bg-transparent border border-gold text-gold hover:-translate-y-0.5 disabled:hover:translate-y-0",
      variant === 'tertiary' && "bg-transparent text-gold hover:opacity-80 px-0 py-0 disabled:hover:opacity-50",
      className
    )} {...props}>
      {children}
    </button>
  );
}

const defaultModuleMaterials: Record<string, any[]> = {
  '01': [{ title: "Thinking and Working with Claude", htmls: [{ title: "Thinking and Working with Claude", content: aifWithClaudeHtml }] }, { title: "Responsible, Ethic dan Safety", htmls: [{ title: "Responsible AI untuk Pemimpin", content: responsibleAiUntukPemimpinHtml }] }, { title: "Asesmen dan Peta Kerja AI", htmls: [{ title: "Materi Visual", images: [] }, { title: "APT Assessment", content: aptAssessmentHtml }, { title: "Peta Use Case AI 2026", content: petaUsecaseAi2026Html }, { title: "Format Data untuk AI", content: formatDataUntukAiHtml }] }],
  '02': [{ title: "Materi AI First Level 2", htmls: [{ title: "AIF Prompting", content: aifPromptingHtml }, { title: "AIF Reading", content: aifReadingHtml }, { title: "Multimodal AI App", url: "https://multimodal-ai-level-2-849022455337.us-west1.run.app" }, { title: "AIF PKM", content: aifPkmHtml }, { title: "AIF Writing", content: aifWritingHtml }] }],
  '03': [{ day: "Day 1", title: "Materi Level 3 Day 1", htmls: [{ title: "AI Skills Manual", content: level3Day1Html }, { title: "CIS Prompting", content: level3Day1_1Html }] }],
  '04': [{ day: "Materi", title: "Thinking with Claude", htmls: [{ title: "Thinking w/ Claude AI", content: twcHtml2 }, { title: "Setup Claude", content: twcHtml1 }] }],
  '05': [{ day: "Day 1", title: "Materi Day 1" }, { day: "Day 2", title: "Materi Day 2" }],
  '06': [{ title: "AI Knowledge Operating System", htmls: [{ title: "AI Knowledge Operating System", content: aiKnowledgeOperatingSystemHtml }] }],
  '07': [],
};

const moduleDescriptions: Record<string, string> = {
  '01': 'Tentukan arah penggunaan AI',
  '02': 'Berikan instruksi yang jelas kepada AI',
  '03': 'Buat hasil kerja dengan bantuan AI',
  '04': 'Asah cara berpikir bersama AI',
  '05': 'Bangun alat dan alur kerja AI',
  '06': 'Terapkan AI dalam pekerjaan',
  '07': 'Susun sistem kerja berbasis AI',
};

function materialOrientation(title: string): string | null {
  if (title === 'Thinking and Working with Claude') return 'Setelah ini, kamu bisa menjelaskan ke timmu kenapa AI-mu bekerja lebih konsisten dari mereka.';
  if (title === 'Responsible AI untuk Pemimpin') return 'Setelah ini, kamu bisa memutuskan data apa yang boleh dan tidak boleh masuk ke AI di konteks kerjamu.';
  if (title === 'APT Assessment') return 'Setelah ini, kamu tahu persis di mana kamu sekarang — dan satu langkah konkret yang paling tepat untuk kamu selanjutnya.';
  return null;
}

function LoginView({ onAuthenticated, notice }: { onAuthenticated?: () => void; notice?: string } = {}) {
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isExpiredOpen, setIsExpiredOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsExpiredOpen(false);
    try {
      const formattedEmail = email.trim().toLowerCase();

      localStorage.setItem('member_last_activity_at', String(Date.now()));
      await signInMember(formattedEmail, password);
      if (isKnowledgeArtifactId(new URLSearchParams(window.location.search).get('artifact'))) {
        localStorage.removeItem('temp_password');
      } else {
        localStorage.setItem('temp_password', password);
      }
      onAuthenticated?.();
    } catch (error: any) {
      localStorage.removeItem('member_last_activity_at');
      // Handle predictable errors without printing to console
      if (error.name === 'ExpiredError' || error.message === 'EXPIRED') {
        setIsExpiredOpen(true);
      } else if (error.message?.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Email atau kata sandi salah.');
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Email belum dikonfirmasi. Silakan cek email Anda.');
      } else if (error.message?.toLowerCase().includes('not found')) {
        setErrorMsg('Akun belum terdaftar.');
      } else {
        setErrorMsg(error.message || 'Gagal autentikasi');
      }
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail) {
      setErrorMsg('Isi email terlebih dahulu untuk reset password.');
      setSuccessMsg(null);
      return;
    }

    setIsResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await sendMemberPasswordReset(formattedEmail);
      setSuccessMsg(`Link reset password sudah dikirim ke ${formattedEmail}.`);
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal mengirim email reset password.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001E3C] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,170,204,0.12),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(252,181,40,0.08),transparent_35%)] z-0"></div>

      <LoginVideoBackground />

      <div className="w-full max-w-md bg-[#001E3C]/85 border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="font-sans font-extrabold text-3xl tracking-tighter text-dark-hi flex items-center gap-2 mb-12">
          sinau.tech <span className="w-2 h-2 rounded-full bg-gold inline-block"></span>
        </div>

        <h1 className="font-sans font-bold text-2xl text-dark-hi mb-2">Portal Akses.</h1>
        <p className="font-body text-dark-md mb-8">
          Kamu sudah mulai berpikir berbeda. Di sini kamu memperkuatnya.
        </p>

        {notice && <p role="status" className="font-body text-sm text-[#F7F9FC] border border-[#00AACC]/40 bg-[#00AACC]/10 p-3 rounded-lg mb-6">{notice}</p>}

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded mb-6 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded mb-6 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="font-body text-xs font-bold text-dark-md tracking-eyebrow uppercase block">Alamat email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat email"
              className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle rounded text-dark-hi placeholder:text-dark-lo focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="font-body text-xs font-bold text-dark-md tracking-eyebrow uppercase block">Kata Sandi</label>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isLoading || isResetLoading}
                className="font-body text-xs text-gold hover:text-dark-hi transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetLoading ? 'Mengirim...' : 'Lupa kata sandi?'}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi"
                className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle rounded text-dark-hi placeholder:text-dark-lo focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all pr-12"
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 max-w-[48px] px-3 flex items-center justify-center text-dark-md hover:text-gold transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full py-4 text-xs font-extrabold" disabled={isLoading}>
              {isLoading ? "Mengautentikasi..." : "Masuk ke Portal"}
            </Button>
          </div>
        </form>
        <div className="mt-6 pt-6 border-t border-white/15 text-center">
          <p className="font-body text-sm text-dark-md mb-3">Belum memiliki akun?</p>
          <a
            href="https://wa.me/6285211168871"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#00AACC] font-body font-bold text-sm text-[#00AACC] hover:bg-[#00AACC]/10 focus-visible:outline-2 focus-visible:outline-[#00AACC] transition-colors"
          >
            Hubungi kami via WhatsApp <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {isExpiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
          <div className="bg-bg-dark border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center transform transition-all relative z-10">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold font-sans text-dark-hi mb-3">Akses Kedaluwarsa</h3>
            <p className="text-dark-md font-body mb-8">
              Masa aktif keanggotaan Anda telah berakhir. Silakan menghubungi Admin untuk memperpanjang akses Anda ke portal.
            </p>
            <Button onClick={() => setIsExpiredOpen(false)} className="w-full justify-center">
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberRow({ mb, now, isUpdating, handleUpdate, handleSendPasswordReset, allGroups, allTiers }: { key?: string | number, mb: any, now: number, isUpdating: boolean, handleUpdate: (id: string, role: string, tier: string, exp: string, portals: string[], sinadMateri: boolean, sinadExercise: boolean, group: string) => void, handleSendPasswordReset: (email: string) => void, allGroups: string[], allTiers: string[] }) {
  const [tier, setTier] = useState(mb.tier || 'Professional');
  const [role, setRole] = useState(mb.role || 'member');
  const [portals, setPortals] = useState<string[]>(mb.allowedPortals || ['aif']);
  const [sinadMateri, setSinadMateri] = useState(mb.sinadMateri || false);
  const [sinadExercise, setSinadExercise] = useState(mb.sinadExercise || false);
  const [group, setGroup] = useState(mb.group || '');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const expiryTime = memberExpiryTime(mb);
  const invalidExpiry = expiryTime !== null && !Number.isFinite(expiryTime);
  const currentExp = expiryTime !== null && !invalidExpiry ? new Date(expiryTime).toISOString().split('T')[0] : '';
  const [exp, setExp] = useState(currentExp);

  const togglePortal = (p: string) => {
    setPortals(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  let sisaWaktu = memberState(mb, now) === 'expired' ? 'Batas waktu tidak tersedia' : 'Tanpa batas tanggal';
  if (invalidExpiry) sisaWaktu = 'Tanggal tidak valid';
  else if (expiryTime !== null) {
    const diffTime = expiryTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    sisaWaktu = diffDays > 0 ? `${diffDays} hari lagi` : 'Kedaluwarsa';
  }

  return (
    <tr className="border-b border-border-light-subtle/50">
      <td className="py-3 px-2 max-w-[200px]">
        {mb.name && <div className="font-body text-sm font-bold text-light-hi truncate" title={mb.name}>{mb.name}</div>}
        <div className="font-body text-xs text-light-md truncate" title={mb.email}>{mb.email}</div>
      </td>
      <td className="py-3 px-2 align-top">
        {!isCustomGroup && (allGroups.includes(group) || group === '') ? (
          <select 
            value={group} 
            onChange={e => {
              if (e.target.value === '_custom_') {
                setIsCustomGroup(true);
                setGroup('');
              } else {
                setGroup(e.target.value);
              }
            }}
            className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs truncate max-w-[150px]"
          >
            <option value="">- Pilih Grup -</option>
            {allGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="_custom_">+ Grup Baru...</option>
          </select>
        ) : (
          <div className="flex items-center gap-1">
            <input 
              type="text" 
              placeholder="Grup baru..."
              value={group} 
              autoFocus
              onChange={e => setGroup(e.target.value)}
              className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs"
            />
            <button 
              onClick={() => {
                setIsCustomGroup(false);
                if (!allGroups.includes(group)) {
                  setGroup('');
                }
              }}
              className="text-light-md hover:text-light-hi px-1 text-lg leading-none"
              title="Batal"
            >
              &times;
            </button>
          </div>
        )}
      </td>
      <td className="py-3 px-2 align-top">
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)}
          className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="py-3 px-2 align-top">
        <div className="flex flex-col gap-1 text-[10px]">
          <label className="flex items-center gap-1 cursor-pointer hover:text-gold-muted"><input type="checkbox" checked={portals.includes('aif')} onChange={() => togglePortal('aif')} /> AIF</label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-gold-muted"><input type="checkbox" checked={portals.includes('idl')} onChange={() => togglePortal('idl')} /> IDL</label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-gold-muted"><input type="checkbox" checked={portals.includes('sinad')} onChange={() => togglePortal('sinad')} /> SinaD</label>
        </div>
      </td>
      <td className="py-3 px-2 align-top">
        <select 
          value={tier} 
          disabled={isUpdating || (invalidExpiry && !exp)}
          onChange={e => {
            const newTier = e.target.value;
            const nextGroup = newTier === AI_OS_TIER ? AI_OS_GROUP : group;
            setTier(newTier);
            setGroup(nextGroup);
            handleUpdate(mb.id, role, newTier, exp, portals, sinadMateri, sinadExercise, nextGroup);
          }}
          className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs"
        >
          {allTiers.map(t => (
            <option key={t} value={t}>{t === 'Teacher' ? 'Teacher (SinaD)' : t === 'Student' ? 'Student (SinaD)' : t}</option>
          ))}
        </select>
        {portals.includes('sinad') && tier === 'Student' && (
          <div className="flex flex-col gap-1 text-[10px] mt-2 border-t border-border-light-subtle pt-2">
            <span className="font-bold text-light-md">Akses SinaD:</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-gold-muted">
              <input type="checkbox" checked={sinadMateri} onChange={(e) => setSinadMateri(e.target.checked)} /> Materi
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-gold-muted">
              <input type="checkbox" checked={sinadExercise} onChange={(e) => setSinadExercise(e.target.checked)} /> Exercise
            </label>
          </div>
        )}
      </td>
      <td className="py-3 px-2 align-top">
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={exp}
            onChange={e => setExp(e.target.value)}
            className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs"
          />
        </div>
        {invalidExpiry && <p className="font-body text-xs text-red-700 mt-2">Tanggal tersimpan tidak valid. Isi tanggal yang benar sebelum menyimpan perubahan.</p>}
      </td>
      <td className="py-3 px-2 text-xs align-top">
        <p className={cn('font-bold mb-2', memberState(mb, now) === 'active' ? 'text-green-700' : memberState(mb, now) === 'expired' ? 'text-red-700' : 'text-light-md')}>{memberStatusLabel(mb, now)}</p>
        <span className={cn("px-2 py-1 rounded inline-block", sisaWaktu === 'Kedaluwarsa' || invalidExpiry ? 'bg-red-100 text-red-700' : 'bg-bg-light text-light-md')}>
           {sisaWaktu}
        </span>
      </td>
      <td className="py-3 px-2 align-top">
        <div className="flex flex-col gap-2">
          <Button 
            disabled={isUpdating || (invalidExpiry && !exp)}
            onClick={() => handleUpdate(mb.id, role, tier, exp, portals, sinadMateri, sinadExercise, group)}
            variant="primary" 
            className="py-1.5 px-4 text-[10px]"
          >
            Simpan
          </Button>
          <Button 
            disabled={isUpdating}
            onClick={() => handleSendPasswordReset(mb.email)}
            variant="secondary" 
            className="py-1.5 px-4 text-[10px]"
            title="Kirim email reset password ke user"
          >
            Reset Sandi
          </Button>
        </div>
      </td>
    </tr>
  );
}

function MateriView() {
  const [selectedModule, setSelectedModule] = useState('04');
  const [materiTitle, setMateriTitle] = useState('');
  const [materiLink, setMateriLink] = useState('');
  const [materiFile, setMateriFile] = useState<File | null>(null);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [materiError, setMateriError] = useState('');

  const MODULES = [
    { id: '01', name: 'Strategize' },
    { id: '02', name: 'Prompt' },
    { id: '03', name: 'Create' },
    { id: '04', name: 'Think' },
    { id: '05', name: 'Build' },
    { id: '06', name: 'Act' },
    { id: '07', name: 'AI Operating System' },
  ];

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setMateriError('');
    const loadAndMigrateMaterials = async () => {
      try {
        let items = await getMateriByModule(selectedModule);
        const migrationKey = `materi_supabase_migrated_${selectedModule}`;
        if (!localStorage.getItem(migrationKey)) {
          const legacyItems: { title: string; url: string }[] = [];
          const stored = localStorage.getItem(`materi_module_${selectedModule}`);
          if (stored) legacyItems.push(...JSON.parse(stored));
          if (selectedModule === '04') {
            const thinkingStored = localStorage.getItem('thinking_with_claude_materials');
            if (thinkingStored) legacyItems.push(...JSON.parse(thinkingStored));
            const oldLink = localStorage.getItem('thinking_with_claude_link');
            if (oldLink) legacyItems.push({ title: 'Thinking with Claude', url: oldLink });
          }

          for (const legacyItem of legacyItems) {
            const alreadyExists = items.some((item) => item.title === legacyItem.title && (item.stored_url || item.url) === legacyItem.url);
            if (!alreadyExists && legacyItem.title && legacyItem.url) {
              await addMateri(selectedModule, legacyItem.title, legacyItem.url);
            }
          }
          localStorage.setItem(migrationKey, 'true');
          if (legacyItems.length > 0) items = await getMateriByModule(selectedModule);
        }
        if (!cancelled) setMateriList(items);
      } catch {
        if (!cancelled) {
          setMateriList([]);
          setMateriError('Materi belum dapat dimuat dari Supabase. Pastikan tabel dan Storage sudah disiapkan.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadAndMigrateMaterials();
    return () => {
      cancelled = true;
    };
  }, [selectedModule]);

  const handleSaveMateri = async (e: FormEvent) => {
    e.preventDefault();
    if (!materiTitle || (!materiLink && !materiFile)) {
      alert("Judul dan link atau file materi harus diisi.");
      return;
    }
    setIsLoading(true);
    setMateriError('');
    try {
      const materialUrl = materiFile
        ? await uploadMateriFile(selectedModule, materiFile)
        : materiLink.trim();
      await addMateri(selectedModule, materiTitle.trim(), materialUrl);
      setMateriList(await getMateriByModule(selectedModule));
      setMateriTitle('');
      setMateriLink('');
      setMateriFile(null);
      alert('Materi berhasil ditambahkan ke Supabase!');
    } catch {
      setMateriError('Materi gagal disimpan. Periksa koneksi dan konfigurasi Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMateri = async (materi: Materi) => {
    setIsLoading(true);
    setMateriError('');
    try {
      await deleteMateri(materi);
      setMateriList((current) => current.filter((item) => item.id !== materi.id));
    } catch {
      setMateriError('Materi gagal dihapus dari Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    if (!materiTitle) {
      setMateriTitle(file.name);
    }
    setMateriFile(file);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <Eyebrow variant="flat">Pengelolaan</Eyebrow>
      <div className="h-6"></div>
      <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-12">
        Kelola Materi
      </h1>

      <div className="bg-white border border-border-light-card p-6 md:p-8 rounded-xl shadow-card mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-border-light-subtle pb-6">
          <div>
            <h3 className="font-sans font-bold text-xl text-light-hi mb-2">Pilih Modul</h3>
            <p className="font-body text-sm text-light-md">Pilih modul yang materinya ingin diubah/ditambah.</p>
          </div>
          <select 
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-border-light-subtle rounded text-light-hi focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted bg-white min-w-[200px]"
          >
            {MODULES.map(m => (
              <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
            ))}
          </select>
        </div>

        <h3 className="font-sans font-bold text-lg text-light-hi mb-2">Tambah/Ubah Materi: {MODULES.find(m => m.id === selectedModule)?.name}</h3>
        <p className="font-body text-sm text-light-md mb-6">Tambah link materi atau unggah file (HTML/PDF/gambar, max 10MB). Materi akan tersimpan di Supabase dan tersedia untuk semua member yang memiliki akses.</p>
        {materiError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{materiError}</div>
        )}
        <form onSubmit={handleSaveMateri} className="flex flex-col gap-4">
          <div className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
            <div className="flex-1 w-full min-w-[200px]">
              <label className="font-body text-xs font-bold text-light-md tracking-eyebrow uppercase block mb-2">Judul Materi</label>
              <input 
                type="text" 
                value={materiTitle}
                onChange={(e) => setMateriTitle(e.target.value)}
                placeholder="Contoh: Modul 1 / Website Utama"
                className="w-full px-4 py-3 border border-border-light-subtle rounded text-light-hi placeholder:text-light-lo focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
            <div className="flex-1 w-full min-w-[200px]">
              <label className="font-body text-xs font-bold text-light-md tracking-eyebrow uppercase block mb-2">Link Materi</label>
              <input 
                type="text" 
                value={materiLink}
                onChange={(e) => setMateriLink(e.target.value)}
                placeholder="https://contoh.com/materi atau unggah file di bawah"
                className="w-full px-4 py-3 border border-border-light-subtle rounded text-light-hi placeholder:text-light-lo focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
             <div className="flex-1 w-full min-w-[200px]">
                <label className="font-body text-xs font-bold text-light-md tracking-eyebrow uppercase block mb-2">Upload File Materi</label>
                <input
                  type="file"
                  accept=".html,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-border-light-subtle rounded text-light-hi file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-muted/10 file:text-gold-muted hover:file:bg-gold-muted/20 transition-all cursor-pointer"
                />
             </div>
             <Button type="submit" variant="primary" disabled={isLoading} className="py-3 px-8 border border-transparent w-full sm:w-auto mt-4 sm:mt-0 disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? 'Menyimpan...' : 'Tambah Materi'}
             </Button>
          </div>
        </form>
        {isLoading && materiList.length === 0 && (
          <p className="mt-8 font-body text-sm text-light-md">Memuat materi dari Supabase...</p>
        )}
        {materiList.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="font-sans font-bold text-sm text-light-hi tracking-eyebrow uppercase mb-4 border-b border-border-light-subtle pb-2">Daftar Materi</h4>
            {materiList.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-4 border border-border-light-subtle rounded-lg bg-bg-light">
                 <div>
                    <div className="font-sans font-bold text-light-hi text-sm">{m.title}</div>
                    <div className="font-mono text-[10px] text-light-lo truncate max-w-xs sm:max-w-md">{m.stored_url?.startsWith('storage:') ? 'File Supabase Storage' : m.url}</div>
                 </div>
                 <button onClick={() => handleDeleteMateri(m)} disabled={isLoading} className="text-red-500 hover:text-red-700 transition-colors p-2 disabled:opacity-50" aria-label={`Hapus ${m.title}`}>
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AdminView() { return <MemberManagement />; }

function DashboardView({ user, forcePasswordReset = false }: { user: User, forcePasswordReset?: boolean }) {
  const artifactProgress = useArtifactProgress(user.id);
  const userEmail = user.email || '';
  const [accessConfig, setAccessConfig] = useState<MemberAccessConfig | undefined>();
  const [allowedPortals, setAllowedPortals] = useState<string[]>(['aif']);
  const [currentPortal, setCurrentPortal] = useState<'hub' | 'aif' | 'idl' | 'sinad'>('hub');
  const [sinadAccess, setSinadAccess] = useState({ tier: 'Professional', materi: false, exercise: false });
  const [isLoadingPortals, setIsLoadingPortals] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const getPortalName = (id: string) => {
    if (id === 'aif') return 'AI First';
    if (id === 'idl') return 'IWDemy Digital Labs (IDL)';
    if (id === 'sinad') return 'SinaD';
    return 'sinau.tech — Area Member';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin' | 'materi' | 'prompts'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(userEmail === 'stephen.tssgroup@gmail.com');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [loadingModule, setLoadingModule] = useState<string | null>(null);
  const [selectedHtmlData, setSelectedHtmlData] = useState<{ activeIndex: number; htmls: { title: string; content?: string; url?: string; images?: string[] }[] } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeModalUrl, setIframeModalUrl] = useState<{url: string, title: string} | null>(null);

  const handleModuleClick = async (moduleId: string, defaultTitle: string, defaultSubtitle: string, defaultMaterials: any[]) => {
    if (loadingModule || !allowedPortals.includes('aif') || !canAccessAifModule(sinadAccess.tier, moduleId, accessConfig)) return;
    setLoadingModule(moduleId);
    let materialLoadFailed = false;
    let materials: Materi[] = [];
    try {
      materials = await getMateriByModule(moduleId === '08' ? '04' : moduleId);
    } catch (error) {
      materialLoadFailed = true;
      console.error('Materi Supabase belum dapat dimuat:', error);
    }

    const finalMaterials = buildArtifactList(moduleId, defaultMaterials, materials);

    setSelectedModule({
      id: moduleId,
      title: defaultTitle,
      subtitle: defaultSubtitle,
      materialLoadFailed,
      materials: finalMaterials
    });
    setLoadingModule(null);
  };

  useEffect(() => {
    if (forcePasswordReset) {
      setIsPasswordModalOpen(true);
      setPasswordMsg({ text: 'Silakan buat password baru untuk menyelesaikan proses reset password.', type: 'success' });
    }
  }, [forcePasswordReset]);

  const handleIdlClick = async (e: any) => {
    e.preventDefault();
    const tempPassword = localStorage.getItem('temp_password');
    if (user.email && tempPassword) {
      // 1. Gabungkan email dan password dengan pemisah titik dua ':'
      const rawCredentials = `${user.email}:${tempPassword}`;

      const stringToHex = (str: string) => {
        return Array.from(str)
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
      };

      const hexCredentials = stringToHex(rawCredentials);

      // 3. Arahkan browser langsung ke aplikasi IDL dengan hash param s
      window.open(`https://idl.iwdemy.com/#s=${hexCredentials}`, '_blank');
    } else {
      // Fallback
      window.open("https://idl.iwdemy.com", '_blank');
    }
  };

  const canAccessModule = (moduleId: string) => {
    return allowedPortals.includes('aif') && canAccessAifModule(sinadAccess.tier, moduleId, accessConfig);
  };

  const canOpenPromptDatabase = !isLoadingPortals && !profileError && canAccessPromptStudio(sinadAccess.tier, accessConfig);

  const [promptStudioInitialMenu, setPromptStudioInitialMenu] = useState('beranda');

  const openPromptDatabase = (menu = 'beranda') => {
    if (!canOpenPromptDatabase) return;
    localStorage.setItem('appToken', 'iwdemy123');
    setPromptStudioInitialMenu(menu);
    setActiveTab('prompts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: 'Password minimal 6 karakter.', type: 'error' });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updateMemberPassword(newPassword);
      setPasswordMsg({ text: 'Password berhasil diubah.', type: 'success' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setPasswordMsg({ text: '', type: '' });
      }, 2000);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('reauthentication')) {
        setPasswordMsg({ text: 'Sesi Anda telah kedaluwarsa. Silakan logout dan login kembali untuk mengubah password.', type: 'error' });
      } else {
        setPasswordMsg({ text: err.message, type: 'error' });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadMemberData = async () => {
      let data;
      try {
        data = await getMyMemberProfile();
      } catch (err) {
        console.error("Gagal mendapatkan data member", err);
        if (isMounted) {
          setProfileError(true);
          setIsLoadingPortals(false);
        }
        return;
      }

      try {
        if (!isMounted) return;

        setIsAdmin(data.role === 'admin');

        setAccessConfig(data.accessConfig);
        let portals = data.allowedPortals || ["aif"];
        if (!data.accessV2 && data.tier === "TWC" && !portals.includes("idl")) {
          portals.push("idl");
        }
        if (!data.accessV2 && user.email === 'stephen.tssgroup@gmail.com') {
           if (!portals.includes('idl')) portals.push('idl');
           if (!portals.includes('sinad')) portals.push('sinad');
           if (!portals.includes('aif')) portals.push('aif');
           setIsAdmin(true);
        }
        setAllowedPortals(portals);
        // Only set current portal once to avoid jumping around on updates
        setCurrentPortal(prev => prev !== 'hub' && portals.includes(prev) ? prev : portals.length === 1 ? (portals[0] as any) : 'hub');

        setSinadAccess({
          tier: data.tier || 'Professional',
          materi: data.sinadMateri || false,
          exercise: data.sinadExercise || false
        });
      } catch (err) {
        console.error("Error setting portal states", err);
      } finally {
        if (isMounted) {
          setIsLoadingPortals(false);
        }
      }
    };
    loadMemberData();
    window.addEventListener('membership-access-saved', loadMemberData);
    window.addEventListener('focus', loadMemberData);
    return () => {
      isMounted = false;
      window.removeEventListener('membership-access-saved', loadMemberData);
      window.removeEventListener('focus', loadMemberData);
    };
  }, [user.id, user.email]);

  useEffect(() => {
    if (isLoadingPortals) return;
    if (selectedModule && !canAccessModule(selectedModule.id)) { setSelectedModule(null); setSelectedHtmlData(null); }
    if (activeTab === 'prompts' && !canOpenPromptDatabase || activeTab === 'admin' && !isAdmin) setActiveTab('dashboard');
  }, [accessConfig, allowedPortals, isLoadingPortals, isAdmin, activeTab]);

  const handleLogout = async () => {
    try {
      await signOutMember();
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isLoadingPortals && allowedPortals.length === 1 && allowedPortals[0] === 'idl') {
      const tempPassword = localStorage.getItem('temp_password');
      if (user.email && tempPassword) {
        const rawCredentials = `${user.email}:${tempPassword}`;
        const stringToHex = (str: string) => {
          return Array.from(str)
            .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
        };
        const hexCredentials = stringToHex(rawCredentials);
        window.location.href = `https://idl.iwdemy.com/#s=${hexCredentials}`;
      } else {
        window.location.href = "https://idl.iwdemy.com";
      }
    }
  }, [isLoadingPortals, allowedPortals, user.email]);

  if (isLoadingPortals) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-light-md font-mono text-sm uppercase tracking-wider animate-pulse">Memuat data portal...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-body text-light-hi">Akses member belum dapat diverifikasi. Silakan coba muat ulang halaman.</p>
        <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-bg-light antialiased selection:bg-gold selection:text-bg-dark flex flex-col">
      <nav aria-label="Navigasi portal member" className="sticky top-0 z-40 bg-bg-light/95 backdrop-blur-xl border-b border-border-light-subtle px-4 md:px-12 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="font-sans font-extrabold text-xl tracking-tighter text-light-hi flex items-center gap-2">
          {currentPortal === 'hub' ? 'sinau.tech' : getPortalName(currentPortal)} <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 font-body text-sm">
          {allowedPortals.length > 1 && currentPortal !== 'hub' && (
            <button 
              onClick={() => { setCurrentPortal('hub'); setActiveTab('dashboard'); }}
              className="px-3 py-2 rounded-lg text-light-md hover:bg-white hover:text-light-hi cursor-pointer"
            >
              Pilih Portal
            </button>
          )}
          {allowedPortals.includes('aif') && currentPortal === 'aif' && (
            <button
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              className={cn("px-3 py-2 rounded-lg cursor-pointer", activeTab === 'dashboard' ? 'bg-[#001E3C] text-white font-bold' : 'text-light-md hover:bg-white')}
            >Modul Belajar</button>
          )}
          {canOpenPromptDatabase ? (
            <button
              onClick={() => openPromptDatabase()}
              aria-current={activeTab === 'prompts' ? 'page' : undefined}
              className={cn("px-3 py-2 rounded-lg cursor-pointer", activeTab === 'prompts' ? 'bg-[#001E3C] text-white font-bold' : 'text-light-md hover:bg-white')}
            >
              Prompt Studio
            </button>
          ) : null}
          {activeTab !== 'dashboard' && currentPortal !== 'aif' && (
            <button 
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="px-3 py-2 rounded-lg text-light-md hover:bg-white cursor-pointer"
            >
              Kembali ke Portal
            </button>
          )}
          {isAdmin && (
            <details className="relative">
              <summary className="list-none px-3 py-2 rounded-lg text-light-md hover:bg-white cursor-pointer">Pengelolaan ▾</summary>
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-border-light-card shadow-lg p-2 z-50">
              <button 
                onClick={(event) => { setActiveTab('materi'); event.currentTarget.closest('details')?.removeAttribute('open'); }}
                className={cn("w-full text-left px-3 py-2 rounded-lg cursor-pointer hover:bg-bg-light", activeTab === 'materi' ? 'text-gold-muted font-bold' : 'text-light-md')}
              >
                Kelola Materi
              </button>
              <button 
                onClick={(event) => { setActiveTab('admin'); event.currentTarget.closest('details')?.removeAttribute('open'); }}
                className={cn("w-full text-left px-3 py-2 rounded-lg cursor-pointer hover:bg-bg-light", activeTab === 'admin' ? 'text-gold-muted font-bold' : 'text-light-md')}
              >
                Kelola Member
              </button>
              </div>
            </details>
          )}
          <details className="relative">
            <summary className="list-none px-3 py-2 rounded-lg text-light-md hover:bg-white cursor-pointer">Akun ▾</summary>
            <div className="absolute right-0 top-full mt-2 w-64 max-w-[85vw] rounded-xl bg-white border border-border-light-card shadow-lg p-2 z-50">
              <p className="px-3 py-2 text-xs text-light-md break-all border-b border-border-light-card mb-1">{user.user_metadata?.name || user.email}</p>
              <button onClick={(event) => { setIsPasswordModalOpen(true); event.currentTarget.closest('details')?.removeAttribute('open'); }} className="w-full flex items-center gap-2 text-left px-3 py-2 text-light-md hover:bg-bg-light rounded-lg cursor-pointer">
                <Key className="w-4 h-4" /> Ganti kata sandi
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-3 py-2 text-light-md hover:bg-bg-light rounded-lg cursor-pointer">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </details>
        </div>
      </nav>

      <div className="flex-1">
        {activeTab === 'dashboard' ? (
          <>
            {currentPortal === 'hub' && (
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
                <Eyebrow variant="flat">Portal Member</Eyebrow>
                <div className="h-6"></div>
                <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-4">
                  sinau.tech — Area Member
                </h1>
                <p className="font-body text-xl text-light-md mb-12">
                  Pilih portal yang ingin kamu akses.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allowedPortals.includes('aif') && (
                    <button type="button" onClick={() => setCurrentPortal('aif')} className="text-left border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-[#00AACC] focus-visible:outline-2 focus-visible:outline-[#00AACC] transition-colors cursor-pointer group">
                      <div>
                         <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">AI First</div>
                         <p className="font-body text-sm text-light-md mt-4">Kamu ikut AI First. Di sini materi, timeline, dan teman satu cohort-mu.</p>
                      </div>
                      <div className="mt-8 flex items-center justify-end gap-1 font-body text-sm font-bold text-[#005287]">
                        Buka portal <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                  {allowedPortals.includes('idl') && (
                    <a href="https://idl.iwdemy.com" onClick={handleIdlClick} target="_blank" rel="noopener noreferrer" className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group block">
                      <div>
                        <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">IWDemy Digital Labs</div>
                        <p className="font-body text-sm text-light-md mt-4">Akses platform IDL untuk pembelajaran digital.</p>
                      </div>
                      <div className="mt-8 flex items-center justify-end gap-1 font-body text-sm font-bold text-[#005287]">
                        Buka di tab baru <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  )}
                  {allowedPortals.includes('sinad') && (
                    <button type="button" onClick={() => setCurrentPortal('sinad')} className="text-left border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-[#00AACC] focus-visible:outline-2 focus-visible:outline-[#00AACC] transition-colors cursor-pointer group">
                      <div>
                        <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">SinaD</div>
                         <p className="font-body text-sm text-light-md mt-4">Peserta program SinaD. Akses portal edukasi kamu.</p>
                      </div>
                      <div className="mt-8 flex items-center justify-end gap-1 font-body text-sm font-bold text-[#005287]">
                        Buka portal <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </div>
              </main>
            )}

            {currentPortal === 'aif' && (
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <Eyebrow variant="flat">AI First · Area Belajar</Eyebrow>
        <div className="h-6"></div>
        <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-4">
           Selamat datang di AI First.
        </h1>
        <p className="font-body text-lg text-light-md mb-8 max-w-3xl">
           Setiap modul melatih satu cara berpikir tentang pekerjaan. Ikuti dari 01 — urutannya bukan kebetulan. Dan tidak perlu selesai sekarang.
        </p>

        {/* Module list */}
        <div className="mb-12">
          <div className="border-b border-border-light-subtle pb-4 mb-6">
            <h2 className="font-sans font-bold text-xl text-light-hi mb-2">Modul Belajar</h2>
            <p className="font-body text-base text-light-md">Pilih modul, lalu pilih materi yang ingin kamu pelajari.</p>
            {loadingModule && <p role="status" className="font-body text-sm text-[#005287] mt-3">Memuat daftar materi…</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Strategize */}
            <button
              type="button"
              disabled={!canAccessModule('01') || loadingModule !== null}
              aria-label={'Strategize' + (canAccessModule('01') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("01", "Strategize", "Awareness Session", defaultModuleMaterials['01'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Strategize</h3>
            </button>
            {/* Prompt */}
            <button
              type="button"
              disabled={!canAccessModule('02') || loadingModule !== null}
              aria-label={'Prompt' + (canAccessModule('02') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("02", "Prompt", "Chat Mastery", defaultModuleMaterials['02'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Prompt</h3>
            </button>
            {/* Create */}
            <button
              type="button"
              disabled={!canAccessModule('03') || loadingModule !== null}
              aria-label={'Create' + (canAccessModule('03') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("03", "Create", "Output Creation", defaultModuleMaterials['03'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Create</h3>
            </button>
            {/* Think */}
            <button
              type="button"
              disabled={!canAccessModule('04') || loadingModule !== null}
              aria-label={'Think' + (canAccessModule('04') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("04", "Think", "One Day Intensive", defaultModuleMaterials['04'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Think</h3>
            </button>
            {/* Build */}
            <button
              type="button"
              disabled={!canAccessModule('05') || loadingModule !== null}
              aria-label={'Build' + (canAccessModule('05') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("05", "Build", "NoCode AI Build", defaultModuleMaterials['05'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Build</h3>
            </button>
            {/* ACT */}
            <button
              type="button"
              disabled={!canAccessModule('06') || loadingModule !== null}
              aria-label={'Act' + (canAccessModule('06') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#FCB528] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("06", "Act", "Action & Transformation", defaultModuleMaterials['06'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Act</h3>
            </button>
            {/* Thinking With Claude */}
            <button
              type="button"
              disabled={!canAccessModule('08') || loadingModule !== null}
              aria-label={'Thinking With Claude' + (canAccessModule('08') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#00AACC] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("08", "Thinking With Claude", "One Day Intensive", defaultModuleMaterials['04'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF How To</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Thinking With Claude</h3>
            </button>
            {/* AI OS */}
            <button
              type="button"
              disabled={!canAccessModule('07') || loadingModule !== null}
              aria-label={'AI Operating System' + (canAccessModule('07') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#00AACC] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("07", "AI Operating System", "AI Operating System", defaultModuleMaterials['07'])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF How To</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">AI Operating System</h3>
            </button>
            {/* Selling Idea With AI */}
            <button
              type="button"
              disabled={!canAccessModule('09') || loadingModule !== null}
              aria-label={'Selling Idea With AI' + (canAccessModule('09') ? '' : ' — akses terkunci')}
              className="relative text-left border border-[#001E3C]/10 bg-[#00AACC] min-h-[180px] md:min-h-[200px] px-7 md:px-9 pt-20 pb-8 md:pb-9 rounded-xl shadow-card flex flex-col items-start justify-end hover:border-[#001E3C]/40 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-[#00AACC] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleModuleClick("09", "Selling Idea With AI", "", [])}
            >
              <span className="absolute top-5 right-5 md:top-6 md:right-6 font-sans text-sm font-bold text-[#F7F9FC] bg-[#001E3C] border border-[#001E3C] px-3.5 py-1.5 rounded-full tracking-wide">AIF How To</span>
              <h3 className="font-sans font-bold text-2xl md:text-3xl leading-tight text-[#001E3C]">Selling Idea With AI</h3>
            </button>
          </div>
        </div>

        <section aria-label="Portal dan jadwal">
          <h2 className="font-sans font-bold text-xl text-light-hi mb-5">Portal dan Jadwal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a href="https://idl.iwdemy.com" onClick={handleIdlClick} target="_blank" rel="noopener noreferrer" className="bg-white border border-border-light-card p-6 rounded-xl shadow-card hover:border-[#00AACC] focus-visible:outline-2 focus-visible:outline-[#00AACC] transition-colors">
                <BookOpen className="w-5 h-5 text-[#005287] mb-3" />
                <h3 className="font-sans font-bold text-base text-light-hi mb-2">IWDemy Digital Labs</h3>
                <p className="font-body text-sm text-light-md">Tersedia untuk semua tier. Lanjutkan pembelajaran digital di IDL.</p>
                <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-bold text-[#005287]">Buka portal di tab baru <ExternalLink className="w-4 h-4" /></span>
              </a>
            <div className="bg-white border border-border-light-card p-6 rounded-xl shadow-card">
              <Calendar className="w-5 h-5 text-[#005287] mb-3" />
              <h3 className="font-sans font-bold text-base text-light-hi mb-2">Jadwal Sesi Tatap Muka</h3>
              <p className="font-body text-sm text-light-md">Jadwal cohort berikutnya akan diumumkan. Pantau di sini.</p>
            </div>
          </div>
        </section>

        {/* Selected Module Modal */}
        {selectedModule && !selectedHtmlData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-label={`Materi ${selectedModule.title}`} className="bg-bg-dark border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden p-6 md:p-8 relative z-10 flex flex-col">
              <p className="font-body text-sm text-gold mb-2 shrink-0">Daftar materi</p>
              <h3 className="text-2xl font-bold font-sans text-dark-hi mb-1">{selectedModule.title}</h3>
              <p className="text-dark-md font-body mb-6">{moduleDescriptions[selectedModule.id] || selectedModule.subtitle}</p>
              {selectedModule.materialLoadFailed && (
                <p role="status" className="font-body text-sm text-gold mb-4">Sebagian materi belum dapat dimuat. Kembali ke modul, lalu coba buka lagi.</p>
              )}

              <p className="font-body text-sm text-dark-md mb-4">Pilih materi yang ingin kamu pelajari.</p>
              <div className="space-y-3 mb-8 overflow-y-auto min-h-0">
                {selectedModule.materials.map((mat: any, idx: number) => (
                  <button
                    type="button"
                    key={idx} 
                    onClick={() => { if (!canAccessModule(selectedModule.id)) return; artifactProgress.recordOpen(mat.id); setSelectedHtmlData({ activeIndex: 0, htmls: [mat] }); }}
                    className="w-full text-left p-4 border border-border-dark-subtle/30 rounded-xl bg-bg-dark flex justify-between items-center gap-3 group hover:border-gold/30 focus-visible:outline-2 focus-visible:outline-[#00AACC] transition-all cursor-pointer"
                  >
                    <div>
                      <div className="font-sans font-medium text-dark-hi">{mat.title}</div>
                      {artifactProgress.opened.includes(mat.id) && <p className="font-body text-xs text-gold mt-1">Pernah dibuka</p>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-md group-hover:text-gold-muted transition-colors" />
                  </button>
                ))}
                {selectedModule.materials.length === 0 && (
                  <div className="p-4 border border-border-dark-subtle/30 rounded-xl bg-bg-dark text-center">
                    <p className="font-body text-sm text-dark-md">{selectedModule.materialLoadFailed ? 'Daftar materi belum dapat dimuat. Silakan coba lagi.' : 'Materi modul ini belum tersedia. Kamu bisa kembali dan memilih modul lain.'}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedModule(null)} 
                className="w-full py-3 bg-bg-dark border border-border-dark-subtle/30 text-dark-hi rounded-lg font-bold font-body hover:bg-border-dark-subtle/20 transition-colors shrink-0"
              >
                Kembali ke modul
              </button>
            </div>
          </div>
        )}
        {/* Selected Html Modal */}
        {selectedHtmlData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-label={selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.title || 'Materi AI First'} className={`bg-bg-dark border border-white/20 shadow-2xl w-full overflow-hidden p-0 relative z-[61] flex flex-col ${isFullscreen ? 'fixed inset-0 rounded-none max-w-none max-h-none h-screen' : 'rounded-2xl max-w-5xl max-h-[90vh]'}`}>
              <div className="flex flex-col border-b border-border-dark-subtle/30">
                <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                  <h3 className="text-xl font-bold font-sans text-dark-hi">
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.title || "Materi AI First"}
                  </h3>
                  <div className="flex items-center space-x-3">
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.url && (
                      <a 
                        href={selectedHtmlData.htmls[selectedHtmlData.activeIndex].url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-dark-md hover:text-gold-muted transition-colors p-1" 
                        title="Buka di tab baru"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-dark-md hover:text-gold-muted transition-colors p-1" title={isFullscreen ? 'Kecilkan' : 'Layar Penuh'}>
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                    <button onClick={() => { setSelectedHtmlData(null); setIsFullscreen(false); }} className="text-dark-md hover:text-gold-muted transition-colors px-2 py-1">
                      <span className="font-body text-sm font-bold inline-flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Kembali ke daftar materi</span>
                    </button>
                  </div>
                </div>
                {materialOrientation(selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.title) && (
                  <p className="px-4 pb-4 font-body text-sm text-dark-hi">
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.title} — {materialOrientation(selectedHtmlData.htmls[selectedHtmlData.activeIndex]?.title)}
                  </p>
                )}
                {selectedHtmlData.htmls.length > 1 && (
                  <div className="flex px-4 gap-4 overflow-x-auto pb-0 border-b border-border-dark-subtle/10">
                    {selectedHtmlData.htmls.map((h, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedHtmlData({ ...selectedHtmlData, activeIndex: i })}
                        className={`whitespace-nowrap px-4 py-3 font-mono text-sm font-bold border-b-2 transition-colors -mb-[1px] ${i === selectedHtmlData.activeIndex ? 'border-gold text-gold' : 'border-transparent text-dark-md hover:text-dark-hi hover:border-dark-md'}`}
                      >
                        {h.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-auto bg-black p-0 rounded-b-xl">
                {selectedHtmlData.htmls[selectedHtmlData.activeIndex].url ? (
                  <iframe src={selectedHtmlData.htmls[selectedHtmlData.activeIndex].url} className="w-full h-full min-h-[70vh] border-0" title="Materi" />
                ) : selectedHtmlData.htmls[selectedHtmlData.activeIndex].images ? (
                  <div className="w-full h-full min-h-[70vh] overflow-auto p-4 bg-[#F6F4EF] flex flex-col items-center gap-6">
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex].images?.length === 0 && (
                      <div className="p-8 text-black">Images array is empty!</div>
                    )}
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex].images?.map((img, idx) => (
                      <div key={img} className="w-full flex justify-center">
                        <img src={img} className="max-w-full rounded-lg shadow-md" alt={`Materi Strategize ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <iframe
                    srcDoc={selectedHtmlData.htmls[selectedHtmlData.activeIndex].content}
                    onLoad={keepEmbeddedHashNavigationInsideFrame}
                    className="w-full h-full min-h-[70vh] border-0"
                    title="Materi"
                  />
                )}
              </div>
              {/* Bridge CTA to Prompt Studio (Per Spec v2) */}
              {canOpenPromptDatabase && (
                <div className="border-t border-border-dark-subtle/30 bg-bg-dark px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-muted/10 border border-gold-muted/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-gold-muted" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-muted">
                        Praktik &amp; Evaluasi Mandiri
                      </div>
                      <div className="text-xs sm:text-sm font-sans font-semibold text-dark-hi">
                        Selesai membaca? Uji pemahamanmu di Prompt Studio.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedHtmlData(null);
                        setIsFullscreen(false);
                        openPromptDatabase('exercise');
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#00AACC] hover:bg-[#005287] text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Mulai Latihan Kasus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedHtmlData(null);
                        setIsFullscreen(false);
                        openPromptDatabase('prompt-studio');
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-bg-dark hover:bg-[#005287] text-dark-hi font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-border-dark-subtle/40 cursor-pointer"
                    >
                      <span>Buat Formulamu Sendiri</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
            <div className="bg-bg-dark border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 transform transition-all relative z-10">
              <h3 className="text-2xl font-bold font-sans text-dark-hi mb-6">Ganti Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium font-sans text-dark-md mb-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle text-dark-hi rounded-lg focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-colors font-body pr-12"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-dark-md hover:text-gold transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {passwordMsg.text && (
                  <div className={cn("p-4 rounded-lg text-sm font-sans font-medium", passwordMsg.type === 'error' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20")}>
                    {passwordMsg.text}
                  </div>
                )}
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => { setIsPasswordModalOpen(false); setPasswordMsg({text:'', type:''}); setNewPassword(''); }} 
                    className="flex-1 py-3 bg-bg-dark border border-border-dark-subtle/30 text-dark-hi rounded-lg font-bold font-mono tracking-wider hover:bg-border-dark-subtle/20 transition-colors"
                  >
                    BATAL
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 py-3 bg-gold-muted text-white rounded-lg font-bold font-body hover:bg-gold transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? '...' : 'SIMPAN'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
            )}

            {currentPortal === 'idl' && (
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <div className="w-20 h-20 rounded-2xl bg-bg-light border border-border-light-subtle flex items-center justify-center mb-8">
                  <BookOpen className="w-10 h-10 text-gold-muted" />
                </div>
                <Eyebrow variant="flat">IWDemy Digital Lab</Eyebrow>
                <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mt-4 mb-4">
                  Coming Soon
                </h1>
                <h3 className="font-body text-lg text-light-md max-w-lg mx-auto">
                  Platform IWDemy Digital Lab sedang dalam tahap pengembangan. Silakan kembali lagi nanti.
                </h3>
              </main>
            )}

            {currentPortal === 'sinad' && (
              <SinadPortal />
            )}

            {/* Generic Iframe Modal */}
            {iframeModalUrl && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
                <div className={`bg-bg-light border border-border-light-subtle/30 shadow-2xl w-full overflow-hidden p-0 transform transition-all relative z-[61] flex flex-col ${isFullscreen ? 'fixed inset-0 rounded-none max-w-none max-h-none h-screen' : 'rounded-2xl max-w-5xl max-h-[90vh]'}`}>
                  <div className="flex justify-between items-center p-4 border-b border-border-light-subtle/30 bg-white">
                    <h3 className="text-xl font-bold font-sans text-light-hi">{iframeModalUrl.title}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-light-md hover:text-gold transition-colors p-1" title={isFullscreen ? 'Kecilkan' : 'Layar Penuh'}>
                          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setIframeModalUrl(null)} className="text-light-md hover:text-gold transition-colors p-1">
                          <X className="w-6 h-6" />
                        </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-white min-h-[80vh]">
                    <iframe src={iframeModalUrl.url} className="w-full h-full min-h-[80vh] border-0" title={iframeModalUrl.title} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'prompts' ? (
          canOpenPromptDatabase
            ? <PromptDatabaseView initialMenu={promptStudioInitialMenu} onBack={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            : <div className="p-12 text-center font-body text-light-md">Akses Prompt Studio tidak tersedia untuk akun ini.</div>
        ) : activeTab === 'admin' ? (
          <AdminView />
        ) : (
          <MateriView />
        )}
      </div>
    </div>
  );
}

function Application() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const dailySession = useDailySession(user);
  const requestedArtifact = new URLSearchParams(window.location.search).get('artifact');

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
    }).catch((err) => {
      console.error("Gagal memvalidasi sesi:", err);
      setUser(null);
      setAuthInitialized(true);
    });

    const unsubscribe = onAuthUserChange((currentUser, event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (currentUser) markDailySession(currentUser.id);
        setForcePasswordReset(true);
      }
      if (!currentUser) setForcePasswordReset(false);
      setUser(currentUser);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-gold font-mono uppercase tracking-widest text-xs font-bold">Memuat...</div>;
  }

  if (user && dailySession.expired) {
    if (dailySession.error) return <LoginView notice={dailySession.error} />;
    return <div role="status" className="min-h-screen bg-[#001E3C] flex items-center justify-center p-6 font-body text-[#F7F9FC]">Hari telah berganti. Mengeluarkan akun…</div>;
  }

  return (
    <>
      {!user ? <LoginView notice={dailySession.notice} /> : isKnowledgeArtifactId(requestedArtifact) ? <KnowledgeArtifactPortal initialId={requestedArtifact} /> : <DashboardView user={user} forcePasswordReset={forcePasswordReset} />}
    </>
  );
}

export default function App() {
  const [loginPreview, setLoginPreview] = useState(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'login');
  if (loginPreview) return <LoginView onAuthenticated={() => {
    const destination = new URL(window.location.href);
    destination.searchParams.delete('preview');
    window.history.replaceState(window.history.state, '', destination.pathname + destination.search + destination.hash);
    setLoginPreview(false);
  }} />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'member-access') {
    return <main className="min-h-screen bg-[#F7F9FC] p-4 md:p-10"><div className="max-w-5xl mx-auto"><a href="/" className="inline-block font-body text-[#005287] mb-6">← Kembali ke portal</a><LocalMemberListPreview /></div></main>;
  }
  return <Application />;
}
