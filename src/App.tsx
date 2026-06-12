import { signInWithEmailAndPassword, createUserWithEmailAndPassword, secondaryAuth, auth, signOut, handleFirestoreError, OperationType } from './lib/firebase';
import { BookOpen, Calendar, ChevronRight, FileText, Lock, LogOut, Video, Key, Maximize, Minimize, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, type ReactNode, type ButtonHTMLAttributes, type FormEvent } from 'react';
import { cn } from './lib/utils';
import { onAuthStateChanged, type User, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, updateDoc, Timestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import aifPromptingHtml from '../materi/Prompt day1/aif-prompting-level2-day1.html?raw';
import aifReadingHtml from '../materi/Prompt day1/aif-reading-level2-day1.html?raw';
import aifPkmHtml from '../materi/Prompt day2/aif-pkm-level2-day2.html?raw';
import aifWritingHtml from '../materi/Prompt day2/aif-writing-level2-day2.html?raw';
import level3Day1Html from './Level 3/Level 3 day 1.html?raw';
import level3Day1_1Html from './Level 3/Level 3 day 1.1.html?raw';
import aptAssessmentHtml from './Strategize/apt-assessment.html?raw';
import stratImg1 from './Strategize/image (1).png';
import stratImg2 from './Strategize/image (2).png';
import stratImg3 from './Strategize/image (3).png';
import stratImg4 from './Strategize/image (4).png';

function Eyebrow({ children, variant = 'light' }: { children: ReactNode, variant?: 'light' | 'dark' | 'flat' }) {
  return (
    <span className={cn(
      "inline-block font-mono font-bold tracking-eyebrow uppercase px-4 py-1.5 rounded-full text-xs",
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
      variant === 'primary' && "bg-gold text-bg-dark hover:-translate-y-0.5 hover:shadow-card disabled:hover:translate-y-0",
      variant === 'secondary' && "bg-transparent border border-gold text-gold hover:-translate-y-0.5 disabled:hover:translate-y-0",
      variant === 'tertiary' && "bg-transparent text-gold hover:opacity-80 px-0 py-0 disabled:hover:opacity-50",
      className
    )} {...props}>
      {children}
    </button>
  );
}

function LoginView() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpiredOpen, setIsExpiredOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg(null);
    setIsExpiredOpen(false);
    try {
      const formattedEmail = email.trim().toLowerCase();
      
      // Login
      await signInWithEmailAndPassword(auth, formattedEmail, password);
      sessionStorage.setItem('temp_password', password);
      
      const isMainAdmin = formattedEmail === 'stephen.tssgroup@gmail.com';
      const user = auth.currentUser;
      
      if (user) {
        const userDocRef = doc(db, 'members', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Buat data member baru dengan tier basic dan tanpa expiry (atau default admin)
          await setDoc(userDocRef, {
            userId: user.uid,
            email: formattedEmail,
            name: isMainAdmin ? 'Admin' : formattedEmail.split('@')[0],
            role: isMainAdmin ? 'admin' : 'member',
            status: 'active',
            tier: isMainAdmin ? 'Leader' : 'Normal',
            expiresAt: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          // Jika sudah ada, validasi tanggal kedaluwarsa jika bukan main admin
          if (!isMainAdmin) {
            const data = userDoc.data();
            if (data.expiresAt) {
              const expiresDate = data.expiresAt.toDate();
              if (expiresDate < new Date()) {
                await signOut(auth);
                const expiredError = new Error('EXPIRED');
                expiredError.name = 'ExpiredError';
                throw expiredError;
              }
            }
          }
        }
      }
    } catch (error: any) {
      // Handle predictable errors without printing to console
      if (error.name === 'ExpiredError' || error.message === 'EXPIRED') {
        setIsExpiredOpen(true);
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi salah.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMsg('Akun belum terdaftar.');
      } else {
        setErrorMsg(error.message || 'Gagal autentikasi');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Decorative Tech Nodes */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <line x1="200" y1="200" x2="400" y2="300" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.2"/>
        <line x1="400" y1="300" x2="600" y2="150" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.2"/>
        <line x1="400" y1="300" x2="350" y2="600" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.2"/>
        <circle cx="200" cy="200" r="4.5" fill="#D4A84B" fillOpacity="0.4"/>
        <circle cx="400" cy="300" r="6" fill="#D4A84B" fillOpacity="0.6"/>
        <circle cx="600" cy="150" r="4.5" fill="#D4A84B" fillOpacity="0.4"/>
        <circle cx="350" cy="600" r="4.5" fill="#D4A84B" fillOpacity="0.4"/>
        
        <line x1="700" y1="600" x2="800" y2="800" stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.2"/>
        <circle cx="700" cy="600" r="6" fill="#D4A84B" fillOpacity="0.4"/>
        <circle cx="800" cy="800" r="4.5" fill="#D4A84B" fillOpacity="0.4"/>
      </svg>
      
      <div className="w-full max-w-md bg-[#161412] border border-border-dark-subtle/30 rounded-2xl p-8 md:p-12 shadow-2xl relative z-10">
        <div className="font-sans font-extrabold text-3xl tracking-tighter text-dark-hi flex items-center gap-2 mb-12">
          AIF Community <span className="w-2 h-2 rounded-full bg-gold inline-block"></span>
        </div>
        
        <h1 className="font-sans font-bold text-2xl text-dark-hi mb-2">Portal Akses.</h1>
        <p className="font-body text-dark-md mb-8">
          Community AI First
        </p>
        
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded mb-6 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold text-dark-md tracking-eyebrow uppercase block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle rounded text-dark-hi placeholder:text-dark-lo focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold text-dark-md tracking-eyebrow uppercase block">Kata Sandi</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
      </div>

      {isExpiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
          <div className="bg-[#161412] border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center transform transition-all relative z-10">
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

function MemberRow({ mb, isUpdating, handleUpdate, handleSendPasswordReset, allGroups }: { key?: string | number, mb: any, isUpdating: boolean, handleUpdate: (id: string, role: string, tier: string, exp: string, portals: string[], sinadMateri: boolean, sinadExercise: boolean, group: string) => void, handleSendPasswordReset: (email: string) => void, allGroups: string[] }) {
  const [tier, setTier] = useState(mb.tier || 'Professional');
  const [role, setRole] = useState(mb.role || 'member');
  const [portals, setPortals] = useState<string[]>(mb.allowedPortals || ['aif']);
  const [sinadMateri, setSinadMateri] = useState(mb.sinadMateri || false);
  const [sinadExercise, setSinadExercise] = useState(mb.sinadExercise || false);
  const [group, setGroup] = useState(mb.group || '');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const currentExp = mb.expiresAt ? mb.expiresAt.toDate().toISOString().split('T')[0] : '';
  const [exp, setExp] = useState(currentExp);
  
  const togglePortal = (p: string) => {
    setPortals(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };
  
  let sisaWaktu = 'Selamanya';
  if (mb.expiresAt) {
    const diffTime = mb.expiresAt.toDate().getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    sisaWaktu = diffDays > 0 ? `${diffDays} hari lagi` : 'Kedaluwarsa';
  }
  
  return (
    <tr className="border-b border-border-light-subtle/50">
      <td className="py-3 px-2 font-mono text-xs max-w-[150px] truncate" title={mb.email}>{mb.email}</td>
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
          onChange={e => setTier(e.target.value)}
          className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted text-xs"
        >
          <option value="Professional">Professional</option>
          <option value="Leaders">Leaders</option>
          <option value="Community">Community</option>
          <option value="Internal">Internal</option>
          <option value="Teacher">Teacher (SinaD)</option>
          <option value="Student">Student (SinaD)</option>
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
      </td>
      <td className="py-3 px-2 text-xs align-top">
        <span className={cn("px-2 py-1 rounded inline-block", sisaWaktu === 'Selamanya' ? 'bg-green-100 text-green-700' : sisaWaktu === 'Kedaluwarsa' ? 'bg-red-100 text-red-700' : 'bg-gold-muted/20 text-gold-muted font-semibold')}>
           {sisaWaktu}
        </span>
      </td>
      <td className="py-3 px-2 align-top">
        <div className="flex flex-col gap-2">
          <Button 
            disabled={isUpdating}
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

function AdminView() {
  const [members, setMembers] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (sn) => {
      setMembers(sn.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Gagal mendapatkan member", error);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (memberId: string, role: string, newTier: string, expiresAtStr: string, allowedPortals: string[], sinadMateri: boolean, sinadExercise: boolean, group: string) => {
    setIsUpdating(true);
    try {
      const ref = doc(db, 'members', memberId);
      const updateData: any = { role, tier: newTier, allowedPortals, sinadMateri, sinadExercise, group, updatedAt: serverTimestamp() };
      
      if (expiresAtStr) {
        updateData.expiresAt = Timestamp.fromDate(new Date(expiresAtStr));
      } else {
        updateData.expiresAt = null;
      }
      
      await updateDoc(ref, updateData);
    } catch (err) {
      console.error(err);
      alert('Gagal update data member');
    }
    setIsUpdating(false);
  };

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ text: '', type: '' });

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setIsCreating(true);
    setCreateMsg({ text: '', type: '' });
    
    try {
      const emailFormatted = newEmail.trim().toLowerCase();
      
      let uid = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailFormatted, newPassword);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // Attempt to login to get UID if they provided the correct password
          try {
            const { signInWithEmailAndPassword } = await import('./lib/firebase');
            const userCredential = await signInWithEmailAndPassword(secondaryAuth, emailFormatted, newPassword);
            uid = userCredential.user.uid;
          } catch (loginErr) {
            throw new Error('Email sudah terdaftar dengan kata sandi berbeda. Minta user login pertama kali agar datanya muncul, atau masukkan kata sandi yang benar.');
          }
        } else {
          throw authErr;
        }
      }
      
      const userDocRef = doc(db, 'members', uid);
      const newMemberData = {
        userId: uid,
        email: emailFormatted,
        name: emailFormatted.split('@')[0],
        role: 'member',
        status: 'active',
        tier: 'Professional',
        allowedPortals: ['aif'],
        expiresAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, newMemberData);
      await secondaryAuth.signOut();
      
      setCreateMsg({ text: `Berhasil menambahkan akun: ${emailFormatted}`, type: 'success' });
      setNewEmail('');
      setNewPassword('');
    } catch (err: any) {
      // Console error hidden for auth already in use etc to avoid false alarms
      setCreateMsg({ text: err.message || 'Gagal membuat akun.', type: 'error' });
    }
    setIsCreating(false);
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Email reset password berhasil dikirim ke ${email}. User dapat mengganti password melalui tautan di email tersebut.`);
    } catch (err: any) {
      alert(`Gagal mengirim email reset password: ${err.message}`);
    }
  };

  const predefinedGroups = ["AIF Leaders Batch 1", "AIF Professional Batch 1", "Internal Office", "Community"];
  const allGroups = Array.from(new Set([
    ...predefinedGroups,
    ...members.map(m => m.group).filter(Boolean)
  ])).sort();

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
      <Eyebrow variant="flat">Admin Panel</Eyebrow>
      <div className="h-6"></div>
      <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-12">
        Manajemen Keanggotaan
      </h1>

      <div className="bg-white border border-border-light-card p-6 md:p-8 rounded-xl shadow-card mb-8">
        <h3 className="font-sans font-bold text-xl text-light-hi mb-2">Tambah Member Baru</h3>
        <p className="font-body text-sm text-light-md mb-6">Buat akun untuk memberikan akses ke portal.</p>
        
        <form onSubmit={handleCreateUser} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="font-mono text-xs font-bold text-light-md tracking-eyebrow uppercase block mb-2">Email</label>
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              placeholder="nama@perusahaan.com"
              className="w-full px-4 py-3 border border-border-light-subtle rounded text-light-hi placeholder:text-light-lo focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-all"
              disabled={isCreating}
            />
          </div>
          <div className="flex-1 w-full min-w-[200px]">
            <label className="font-mono text-xs font-bold text-light-md tracking-eyebrow uppercase block mb-2">Kata Sandi</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 border border-border-light-subtle rounded text-light-hi placeholder:text-light-lo focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-all pr-12"
                disabled={isCreating}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-light-md hover:text-gold-muted transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={isCreating} className="py-3 px-8 border border-transparent w-full sm:w-auto mt-4 sm:mt-0">
            {isCreating ? "Menambahkan..." : "Tambah"}
          </Button>
        </form>

        {createMsg.text && (
          <div className={cn("mt-6 p-4 rounded text-sm border font-body", createMsg.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700")}>
            {createMsg.text}
          </div>
        )}
      </div>
      
      <div className="bg-white border border-border-light-card p-6 md:p-8 rounded-xl shadow-card overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-sans font-bold text-xl text-light-hi mb-2">Daftar Member</h3>
            <p className="font-body text-sm text-light-md">Atur role, tingkat keanggotaan (Tier), akses portal, dan batas waktu akses.</p>
          </div>
          <div>
            <select 
              value={filterGroup} 
              onChange={e => setFilterGroup(e.target.value)}
              className="px-4 py-2 border border-border-light-subtle rounded text-sm text-light-hi bg-white focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted min-w-[200px]"
            >
              <option value="">Semua Grup</option>
              {allGroups.map((group: any) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        <datalist id="groupList">
          {allGroups.map((group: any) => (
            <option key={`dl-${group}`} value={group} />
          ))}
        </datalist>
        
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-border-light-subtle">
              <th className="py-3 px-2 font-bold text-light-hi w-40">Email</th>
              <th className="py-3 px-2 font-bold text-light-hi min-w-[150px]">Grup / Batch</th>
              <th className="py-3 px-2 font-bold text-light-hi w-28">Role</th>
              <th className="py-3 px-2 font-bold text-light-hi w-24">Akses Portal</th>
              <th className="py-3 px-2 font-bold text-light-hi w-32">Tier</th>
              <th className="py-3 px-2 font-bold text-light-hi min-w-[130px]">Atur Waktu</th>
              <th className="py-3 px-2 font-bold text-light-hi min-w-[100px]">Sisa Waktu</th>
              <th className="py-3 px-2 font-bold text-light-hi min-w-[120px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 px-2 text-light-md text-center">Memuat data...</td>
              </tr>
            )}
            {members.filter(mb => filterGroup ? mb.group === filterGroup : true).map(mb => (
              <MemberRow key={mb.id} mb={mb} isUpdating={isUpdating} handleUpdate={handleUpdate} handleSendPasswordReset={handleSendPasswordReset} allGroups={allGroups} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const timelineHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Timeline 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  --bg-dark: #0E0E0E;
  --bg-light: #F8F6F2;
  --gold: #D4A84B;
  --gold-muted: #8B7340;
  --gold-bg: rgba(212,168,75,0.08);
  --gold-border: rgba(212,168,75,0.22);
  --gold-hover: rgba(212,168,75,0.06);
  --text-hi: #F5F2EB;
  --text-md: rgba(245,242,235,0.95);
  --text-lo: rgba(240,236,228,0.75);
  --text-xs: rgba(235,230,220,0.22);
  --dark-text: #0A0A0A;
  --card-border-dark: rgba(212,168,75,0.16);
  --font-heading: 'Plus Jakarta Sans','Calibri','Arial',sans-serif;
  --font-body: 'Inter','Calibri','Arial',sans-serif;
  --font-mono: 'JetBrains Mono','Consolas','Courier New',monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
body { font-family: var(--font-body); background: var(--bg-dark); color: var(--text-hi); }
.page { max-width: 1040px; margin: 0 auto; padding: 40px 16px; }
.panel { display: none; animation: fadeIn 0.4s ease; }
.panel.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.level-head { display: grid; grid-template-columns: 1fr; gap: 6px; align-items: start; padding-bottom: 18px; margin-bottom: 18px; border-bottom: 1px solid var(--text-xs); }
.level-num { font-family: var(--font-heading); font-weight: 800; font-size: 36px; line-height: 1; letter-spacing: -3px; color: var(--gold); opacity: 0.20; text-align: left; }
.level-eyebrow { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; display: inline-flex; padding: 5px 14px; border-radius: 999px; background: var(--gold-bg); border: 1px solid var(--gold-border); }
.level-title { font-family: var(--font-heading); font-size: clamp(20px, 4vw, 26px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: var(--text-hi); margin-bottom: 10px; }
.level-desc { font-size: 14px; font-weight: 500; color: var(--text-md); line-height: 1.7; max-width: 540px; }
.timeline { position: relative; display: flex; flex-direction: column; }
.tl-row { display: grid; grid-template-columns: 72px 28px 1fr; gap: 0; align-items: stretch; }
.tl-date { text-align: left; padding-top: 18px; }
.tl-date .month { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-lo); }
.tl-date .days { font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: var(--text-hi); letter-spacing: -1.5px; line-height: 1.15; margin-top: 1px; }
.tl-track { display: flex; flex-direction: column; align-items: center; }
.tl-dot { width: 10px; height: 10px; border-radius: 50%; border: 2.5px solid var(--gold); background: var(--bg-dark); z-index: 2; margin-top: 20px; flex-shrink: 0; }
.tl-line { width: 1px; flex: 1; background: linear-gradient(to bottom, var(--gold-border), var(--text-xs)); }
.tl-card { padding: 14px 12px 14px 16px; border-bottom: 1px solid var(--card-border-dark); border-radius: 8px; transition: background 0.3s ease, box-shadow 0.3s ease; }
.tl-row:last-child .tl-card { border-bottom: none; }
.tl-row:not(.past) .tl-card:hover { background: var(--gold-bg); box-shadow: 0 4px 16px rgba(212,168,75,0.08); }
.tl-row.next .tl-card { background: rgba(212,168,75,0.06); border: 1px solid rgba(212,168,75,0.15); }
.tl-level { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--gold); letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 3px; }
.tl-title { font-size: 12px; font-weight: 500; color: var(--text-md); margin-bottom: 4px; }
.tl-sub { font-size: 12px; font-weight: 500; color: var(--text-lo); line-height: 1.5; }
.tl-format { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.05em; color: var(--text-lo); margin-top: 8px; padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 999px; display: inline-block; }
.tl-row.graduation .tl-dot { width: 12px; height: 12px; background: var(--gold); border-color: var(--gold); box-shadow: 0 0 0 4px rgba(139,115,64,0.18); }
.tl-row.graduation .tl-level { color: var(--gold); font-size: 17px; }
.tl-row.past { opacity: 0.4; }
.tl-row.past .tl-dot { background: var(--text-lo); border-color: var(--text-lo); }
.tl-row.past .tl-level { text-decoration: line-through; text-decoration-color: var(--text-xs); }
.tl-row.next .tl-dot { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 0 4px rgba(139,115,64,0.18); }
.tl-badge { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; margin-left: 8px; display: inline-block; vertical-align: middle; }
.tl-badge.done { background: var(--text-xs); color: var(--text-lo); }
.tl-badge.next { background: var(--gold-bg); color: var(--gold); }
@media (min-width: 640px) { .page { padding: 60px 32px; } .level-head { grid-template-columns: auto 1fr; gap: 28px; padding-bottom: 22px; margin-bottom: 22px; } .level-num { display: block; text-align: right; font-size: 52px; min-width: 64px; } .level-title { font-size: clamp(22px, 3vw, 28px); } .tl-row { grid-template-columns: 80px 32px 1fr; } .tl-date .days { font-size: 24px; } }
@media (min-width: 960px) { .page { padding: 60px 48px; } .level-head { gap: 24px; } .level-num { font-size: 64px; min-width: 80px; opacity: 0.18; } .level-title { font-size: clamp(26px, 2.8vw, 32px); margin-bottom: 12px; } .level-desc { font-size: 15px; } .tl-row { grid-template-columns: 88px 32px 1fr; } .tl-date .days { font-size: 26px; } .tl-card { padding: 16px 0 16px 24px; } .tl-level { font-size: 17px; } }
@media (max-width: 639px) { .level-num { display: none; } .tl-row { grid-template-columns: 60px 24px 1fr; } .tl-card { padding: 12px 0 12px 12px; } .tl-level { font-size: 14px; } .tl-title, .tl-sub { font-size: 12px; } .tl-date .days { font-size: 20px; } .tl-date .month { font-size: 10px; } .level-head { padding-bottom: 14px; margin-bottom: 14px; } .level-title { font-size: clamp(18px, 5vw, 24px); margin-bottom: 6px; } .tl-sub, .tl-format { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.35s ease, opacity 0.25s ease, margin 0.25s ease; margin-top: 0; } .tl-row.tl-open .tl-sub, .tl-row.tl-open .tl-format { max-height: 200px; opacity: 1; margin-top: 4px; } .tl-card { cursor: pointer; } }
</style>
</head>
<body>
<div class="page">
  <section class="panel active" id="p-calendar">
    <div class="level-head">
      <div class="level-num" style="opacity:0.3; color: var(--gold);">&#9673;</div>
      <div class="level-meta">
        <div class="level-eyebrow" style="color: var(--gold);">Timeline 2026</div>
        <h2 class="level-title">Calendar</h2>
        <p class="level-desc">3 bulan &middot; 7&times; tatap muka &middot; 4 level<br>Dari Strategize hingga Build.</p>
      </div>
    </div>
    <div class="timeline">
      <div class="tl-row past"><div class="tl-date"><div class="month">April</div><div class="days">11</div></div><div class="tl-track"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-card"><div class="tl-level">01 &mdash; Strategize <span class="tl-badge done">done</span></div><div class="tl-title">Awareness Session</div><div class="tl-sub">Tren, potensi, dan batasan AI untuk leaders</div><div class="tl-format">Sabtu &middot; 08.00 &ndash; 11.00 &middot; 1 sesi</div></div></div>
      <div class="tl-row next"><div class="tl-date"><div class="month">Mei</div><div class="days">6 &amp; 7</div></div><div class="tl-track"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-card"><div class="tl-level">02 &mdash; Prompt <span class="tl-badge next">next</span></div><div class="tl-title">Chat Mastery</div><div class="tl-sub">Kuasai AI untuk chatting, reading, writing</div><div class="tl-format">In-Person Sabtu &middot; 08.00 &ndash; 16.30 &middot; 2 hari + Live Streaming Rabu</div></div></div>
      <div class="tl-row"><div class="tl-date"><div class="month">Mei</div><div class="days">16 &amp; 23</div></div><div class="tl-track"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-card"><div class="tl-level">03 &mdash; Create</div><div class="tl-title">Output Creation</div><div class="tl-sub">Dari prompt ke produk &mdash; docs, artifacts, files</div><div class="tl-format">In-Person Sabtu &middot; 08.00 &ndash; 16.30 &middot; 2 hari + Live Streaming Rabu</div></div></div>
      <div class="tl-row"><div class="tl-date"><div class="month">Juni</div><div class="days">6 &amp; 20</div></div><div class="tl-track"><div class="tl-dot"></div><div class="tl-line"></div></div><div class="tl-card"><div class="tl-level">04 &mdash; Build</div><div class="tl-title">NoCode AI Build</div><div class="tl-sub">Bangun workflows, tools &amp; system berbasis AI</div><div class="tl-format">In-Person &middot; Project Based &middot; 2 hari</div></div></div>
      <div class="tl-row graduation"><div class="tl-date"><div class="month">Juli</div><div class="days">4</div></div><div class="tl-track"><div class="tl-dot"></div></div><div class="tl-card"><div class="tl-level">Graduation</div><div class="tl-sub">Showcase hasil karya &amp; sertifikasi dari IWDemy</div></div></div>
    </div>
  </section>
</div>
<script>
  if (window.matchMedia('(max-width: 639px)').matches) {
    document.querySelectorAll('.tl-row').forEach(row => {
      row.addEventListener('click', () => {
        row.classList.toggle('tl-open');
      });
    });
  }
</script>
</body>
</html>
`;

function DashboardView({ user }: { user: User }) {
  const userEmail = user.email || '';
  const [allowedPortals, setAllowedPortals] = useState<string[]>(['aif']);
  const [currentPortal, setCurrentPortal] = useState<'hub' | 'aif' | 'idl' | 'sinad'>('hub');
  const [sinadAccess, setSinadAccess] = useState({ tier: 'Professional', materi: false, exercise: false });
  const [isLoadingPortals, setIsLoadingPortals] = useState(true);

  const getPortalName = (id: string) => {
    if (id === 'aif') return 'AIF Community';
    if (id === 'idl') return 'IWDemy Digital Labs (IDL)';
    if (id === 'sinad') return 'SinaD';
    return 'TSS Group Hub';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(userEmail === 'stephen.tssgroup@gmail.com');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedHtmlData, setSelectedHtmlData] = useState<{ activeIndex: number; htmls: { title: string; content?: string; url?: string; images?: string[] }[] } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleIdlClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const tempPassword = sessionStorage.getItem('temp_password');
    if (user.email && tempPassword) {
      // 1. Gabungkan email dan password dengan pemisah titik dua ':'
      const rawCredentials = `${user.email}:${tempPassword}`;
      
      // 2. Ubah ke format Base64 menggunakan fungsi bawaan browser 'btoa'
      const base64Credentials = btoa(rawCredentials);
      
      // 3. Arahkan browser langsung ke aplikasi IDL dengan hash param autologin
      window.open(`https://idl.iwdemy.com/#autologin=${base64Credentials}`, '_blank');
    } else {
      // Fallback
      window.open("https://idl.iwdemy.com", '_blank');
    }
  };

  const canAccessModule = (moduleId: string) => {
    const tier = sinadAccess.tier; // This is the user's tier for the portal

    if (moduleId === '01') return true; // Strategize available to all
    
    if (moduleId === '02') { // Prompt
      return tier === 'Professional' || tier === 'Leaders' || tier === 'Internal';
    }

    if (moduleId === '03' || moduleId === '04') { // Create, Build
      return tier === 'Leaders' || tier === 'Internal';
    }
    
    return false;
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: 'Password minimal 6 karakter.', type: 'error' });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      setPasswordMsg({ text: 'Password berhasil diubah.', type: 'success' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setPasswordMsg({ text: '', type: '' });
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMsg({ text: 'Sesi Anda telah kedaluwarsa. Silakan logout dan login kembali untuk mengubah password.', type: 'error' });
      } else {
        setPasswordMsg({ text: err.message, type: 'error' });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    let unsubscribe: any = null;
    const subscribeMemberData = () => {
      try {
        const docRef = doc(db, 'members', user.uid);
        unsubscribe = onSnapshot(docRef, (sn) => {
          if (sn.exists()) {
            const data = sn.data();
            if (data.role === 'admin') setIsAdmin(true);
            
            let portals = data.allowedPortals || ['aif'];
            // Fallback if the user is main admin
            if (user.email === 'stephen.tssgroup@gmail.com') {
               if (!portals.includes('idl')) portals.push('idl');
               if (!portals.includes('sinad')) portals.push('sinad');
               if (!portals.includes('aif')) portals.push('aif');
               setIsAdmin(true);
            }
            setAllowedPortals(portals);
            // Only set current portal once to avoid jumping around on updates
            setCurrentPortal(prev => prev === 'hub' ? (portals.length > 1 ? 'hub' : (portals[0] as any)) : prev);
            
            setSinadAccess({
              tier: data.tier || 'Professional',
              materi: data.sinadMateri || false,
              exercise: data.sinadExercise || false
            });
          } else if (user.email === 'stephen.tssgroup@gmail.com') {
            setAllowedPortals(['aif', 'idl', 'sinad']);
            setCurrentPortal('hub');
            setIsAdmin(true);
            setSinadAccess({ tier: 'Internal', materi: true, exercise: true });
          }
          setIsLoadingPortals(false);
        });
      } catch (err) {
        console.error("Gagal mendapatkan data member", err);
        setIsLoadingPortals(false);
      }
    };
    subscribeMemberData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user.uid, user.email]);

  if (isLoadingPortals) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-light-md font-mono text-sm uppercase tracking-wider animate-pulse">Memuat data portal...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light antialiased selection:bg-gold selection:text-bg-dark flex flex-col">
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-bg-light/90 border-b border-border-light-subtle px-6 md:px-12 h-20 flex items-center justify-between shrink-0">
        <div className="font-sans font-extrabold text-xl tracking-tighter text-light-hi flex items-center gap-2">
          {currentPortal === 'hub' ? 'TSS Portal' : getPortalName(currentPortal)} <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
        </div>
        <div className="flex items-center gap-6">
          {allowedPortals.length > 1 && currentPortal !== 'hub' && activeTab === 'dashboard' && (
            <button 
              onClick={() => setCurrentPortal('hub')} 
              className="hidden sm:inline-block transition-colors font-mono uppercase text-xs font-bold tracking-eyebrow text-light-lo hover:text-light-hi"
            >
              Kembali ke Hub
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setActiveTab(activeTab === 'dashboard' ? 'admin' : 'dashboard')} 
              className={cn("hidden sm:inline-block transition-colors font-mono uppercase text-xs font-bold tracking-eyebrow", activeTab === 'admin' ? 'text-gold-muted' : 'text-light-lo hover:text-light-hi')}
            >
              {activeTab === 'dashboard' ? 'Admin Panel' : 'Kembali'}
            </button>
          )}
          <span className="hidden md:inline-block font-body text-sm font-semibold text-light-md">{user.displayName || user.email}</span>
          <button onClick={() => setIsPasswordModalOpen(true)} className="text-light-lo hover:text-light-hi transition-colors p-2 cursor-pointer" title="Ganti Password">
            <Key className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="text-light-lo hover:text-light-hi transition-colors p-2 -mr-2 cursor-pointer" title="Keluar">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex-1">
        {activeTab === 'dashboard' ? (
          <>
            {currentPortal === 'hub' && (
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
                <Eyebrow variant="flat">Central Hub</Eyebrow>
                <div className="h-6"></div>
                <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-4">
                  Selamat datang di Portal Utama TSS Group.
                </h1>
                <h3 className="font-body text-xl text-light-md mb-12">
                  Silakan pilih platform yang ingin Anda akses.
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allowedPortals.includes('aif') && (
                    <div onClick={() => setCurrentPortal('aif')} className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group">
                      <div>
                        <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">AIF Community</div>
                        <p className="font-body text-sm text-light-md mt-4">Akses portal member Artificial Intelligence First.</p>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ChevronRight className="w-5 h-5 text-light-lo group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  )}
                  {allowedPortals.includes('idl') && (
                    <a href="https://idl.iwdemy.com" onClick={handleIdlClick} target="_blank" rel="noopener noreferrer" className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group block">
                      <div>
                        <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">IWDemy Digital Labs</div>
                        <p className="font-body text-sm text-light-md mt-4">Akses platform IDL untuk pembelajaran digital.</p>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ChevronRight className="w-5 h-5 text-light-lo group-hover:text-gold transition-colors" />
                      </div>
                    </a>
                  )}
                  {allowedPortals.includes('sinad') && (
                    <div onClick={() => setCurrentPortal('sinad')} className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group">
                      <div>
                        <div className="font-sans font-bold text-2xl text-light-hi mb-2 group-hover:text-gold transition-colors">SinaD</div>
                        <p className="font-body text-sm text-light-md mt-4">Akses portal SinaD untuk inisiatif edukasi.</p>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ChevronRight className="w-5 h-5 text-light-lo group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  )}
                </div>
              </main>
            )}

            {currentPortal === 'aif' && (
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
        <Eyebrow variant="flat">Membership AI First</Eyebrow>
        <div className="h-6"></div>
        <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-4">
          Selamat datang di Portal Member AIF Community.
        </h1>
        <h3 className="font-body text-xl text-light-md mb-12">
          Mari lanjutkan progres Anda hari ini dan Lihat modul terbaru serta jadwal sesi Anda di sini.
        </h3>
        
        {/* Progress Insight */}
        <div className="mb-12">
          <div className="flex items-center justify-between border-b border-border-light-subtle pb-4 mb-8">
            <h2 className="font-sans font-bold text-xl text-light-hi">Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "01", title: "Strategize", subtitle: "Awareness Session", materials: [{ title: "Materi Sesi Penuh", htmls: [{ title: "Materi Visual", images: [stratImg1, stratImg2, stratImg3, stratImg4] }, { title: "APT Assessment", content: aptAssessmentHtml }] }] })}>
              <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">01</span>
              <div>
                <div className="font-sans font-bold text-lg text-light-hi mb-2">Strategize</div>
                <p className="font-body text-sm text-light-md">Awareness Session</p>
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full w-[100%]"></div>
                   </div>
                   <span className="font-mono text-xs text-light-lo">100%</span>
                </div>
              </div>
            </div>
            
            {/* Module 02 - Prompt */}
            {canAccessModule('02') ? (
              <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "02", title: "Prompt", subtitle: "Chat Mastery", materials: [{ day: "Day 1", title: "Materi AI First Level 2", htmls: [{ title: "AIF Prompting", content: aifPromptingHtml }, { title: "AIF Reading", content: aifReadingHtml }, { title: "Multimodal AI App", url: "https://multimodal-ai-level-2-849022455337.us-west1.run.app" }] }, { day: "Day 2", title: "Materi AI First Level 2 Day 2", htmls: [{ title: "AIF PKM", content: aifPkmHtml }, { title: "AIF Writing", content: aifWritingHtml }] }] })}>
                 <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">02</span>
                <div>
                  <div className="font-sans font-bold text-lg text-light-hi mb-2">Prompt</div>
                  <p className="font-body text-sm text-light-md">Chat Mastery</p>
                  <div className="mt-6 flex items-center gap-3">
                     <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                        <div className="bg-gold h-full rounded-full w-[100%]"></div>
                     </div>
                     <span className="font-mono text-xs text-light-lo">100%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border-light-subtle bg-bg-light p-6 md:p-8 rounded-xl opacity-60 flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold text-light-lo tracking-eyebrow uppercase mb-6 block">02</span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-sans font-bold text-lg text-light-md">Prompt</div>
                    <Lock className="w-4 h-4 text-light-lo" />
                  </div>
                  <p className="font-body text-sm text-light-lo mb-4">Akses Terkunci</p>
                  <p className="font-body text-[10px] text-light-lo">Tingkatkan tier Anda ke Professional untuk mengakses.</p>
                </div>
              </div>
            )}

            {/* Module 03 - Create */}
            {canAccessModule('03') ? (
              <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "03", title: "Create", subtitle: "Output Creation", materials: [{ day: "Day 1", title: "Materi Level 3 Day 1", htmls: [{ title: "AI Skills Manual", content: level3Day1Html }, { title: "CIS Prompting", content: level3Day1_1Html }] }] })}>
                 <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">03</span>
                <div>
                  <div className="font-sans font-bold text-lg text-light-hi mb-2">Create</div>
                  <p className="font-body text-sm text-light-md">Output Creation</p>
                  <div className="mt-6 flex items-center gap-3">
                     <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                        <div className="bg-gold h-full rounded-full w-[100%]"></div>
                     </div>
                     <span className="font-mono text-xs text-light-lo">100%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border-light-subtle bg-bg-light p-6 md:p-8 rounded-xl opacity-60 flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold text-light-lo tracking-eyebrow uppercase mb-6 block">03</span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-sans font-bold text-lg text-light-md">Create</div>
                    <Lock className="w-4 h-4 text-light-lo" />
                  </div>
                  <p className="font-body text-sm text-light-lo mb-4">Akses Terkunci</p>
                  <p className="font-body text-[10px] text-light-lo">Tier Leaders atau Internal diperlukan untuk modul ini.</p>
                </div>
              </div>
            )}
            
            {/* Module 04 - Build */}
            {canAccessModule('04') ? (
              <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "04", title: "Build", subtitle: "NoCode AI Build", materials: [{ day: "Day 1", title: "Materi Day 1" }, { day: "Day 2", title: "Materi Day 2" }] })}>
                 <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">04</span>
                <div>
                  <div className="font-sans font-bold text-lg text-light-hi mb-2">Build</div>
                  <p className="font-body text-sm text-light-md">NoCode AI Build</p>
                  <div className="mt-6 flex items-center gap-3">
                     <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                        <div className="bg-gold h-full rounded-full w-[50%]"></div>
                     </div>
                     <span className="font-mono text-xs text-light-lo">50%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border-light-subtle bg-bg-light p-6 md:p-8 rounded-xl opacity-60 flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold text-light-lo tracking-eyebrow uppercase mb-6 block">04</span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-sans font-bold text-lg text-light-md">Build</div>
                    <Lock className="w-4 h-4 text-light-lo" />
                  </div>
                  <p className="font-body text-sm text-light-lo mb-4">Akses Terkunci</p>
                  <p className="font-body text-[10px] text-light-lo">Tier Leaders atau Internal diperlukan untuk modul ini.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b border-border-light-subtle pb-4 mb-8">
              <h2 className="font-sans font-bold text-xl text-light-hi">Jalur Kepemimpinan Teknis</h2>
            </div>
            
            <div className="space-y-4">
              {/* Module Item Active */}
              <a href="https://idl.iwdemy.com" onClick={handleIdlClick} target="_blank" rel="noopener noreferrer" className="group bg-white border border-border-light-card p-6 md:p-8 rounded-xl shadow-card flex flex-col sm:flex-row gap-6 lg:gap-8 items-start sm:items-center hover:border-gold/30 transition-all cursor-pointer block">
                <div className="w-14 h-14 rounded-lg bg-bg-light border border-border-light-subtle flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-gold-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-lg text-light-hi mb-2 group-hover:text-gold-muted transition-colors">Akses Ke IWDemy Digital Labs</h3>
                  <p className="font-body text-sm text-light-md">Akses platform IDL untuk pembelajaran digital.</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 font-mono text-xs text-gold-muted tracking-eyebrow font-bold uppercase">
                  Lanjutkan <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </a>

              {/* Module Item Locked */}
              <div className="group bg-bg-light border border-transparent p-6 md:p-8 rounded-xl flex flex-col sm:flex-row gap-6 lg:gap-8 items-start sm:items-center opacity-80 mix-blend-multiply">
                <div className="w-14 h-14 rounded-lg border border-border-light-subtle flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-light-lo" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-lg text-light-hi mb-2">Optimasi Jutaan Row</h3>
                  <p className="font-body text-sm text-light-md">Strategi sharding dan read-replicas yang tidak diajarkan di dokumentasi.</p>
                </div>
                <div className="font-mono text-[10px] font-bold text-light-lo tracking-eyebrow uppercase shrink-0">
                  Terkunci
                </div>
              </div>

              {/* Module Item Locked 2 */}
              <div className="group bg-bg-light border border-transparent p-6 md:p-8 rounded-xl flex flex-col sm:flex-row gap-6 lg:gap-8 items-start sm:items-center opacity-80 mix-blend-multiply">
                <div className="w-14 h-14 rounded-lg border border-border-light-subtle flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-light-lo" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-lg text-light-hi mb-2">Engineering Topology</h3>
                  <p className="font-body text-sm text-light-md">Merancang struktur tim di atas struktur microservice.</p>
                </div>
                <div className="font-mono text-[10px] font-bold text-light-lo tracking-eyebrow uppercase shrink-0">
                  Terkunci
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <h2 className="font-sans font-bold text-sm text-light-hi tracking-eyebrow uppercase mb-6 border-b border-border-light-subtle pb-4">Akses Lainnya</h2>
            <div className="space-y-4">
              {sinadAccess.tier === 'Internal' || isAdmin ? (
                <a href="#" onClick={(e) => { e.preventDefault(); setIsTimelineModalOpen(true); }} className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-gold-muted" />
                    <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Sesi Tatap Muka</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
                </a>
              ) : (
                <div className="flex justify-between p-5 bg-bg-light border border-border-light-subtle opacity-60 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-light-lo" />
                    <span className="font-body font-medium text-sm text-light-lo">Sesi Tatap Muka</span>
                  </div>
                  <Lock className="w-4 h-4 text-light-lo" />
                </div>
              )}
              {sinadAccess.tier === 'Internal' || isAdmin ? (
                <a href="#" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                  <div className="flex items-center gap-4">
                    <Video className="w-4 h-4 text-gold-muted" />
                    <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Pustaka Rekaman</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
                </a>
              ) : (
                <div className="flex justify-between p-5 bg-bg-light border border-border-light-subtle opacity-60 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Video className="w-4 h-4 text-light-lo" />
                    <span className="font-body font-medium text-sm text-light-lo">Pustaka Rekaman</span>
                  </div>
                  <Lock className="w-4 h-4 text-light-lo" />
                </div>
              )}
              {sinadAccess.tier === 'Internal' || isAdmin ? (
                <a href="#" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                  <div className="flex items-center gap-4">
                    <FileText className="w-4 h-4 text-gold-muted" />
                    <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Arsip Arsitektur</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
                </a>
              ) : (
                <div className="flex justify-between p-5 bg-bg-light border border-border-light-subtle opacity-60 rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="w-4 h-4 text-light-lo" />
                    <span className="font-body font-medium text-sm text-light-lo">Arsip Arsitektur</span>
                  </div>
                  <Lock className="w-4 h-4 text-light-lo" />
                </div>
              )}
              {sinadAccess.tier !== 'Community' || isAdmin ? (
                <a href="https://prompt-database-v2-0-849022455337.us-west1.run.app" target="_blank" rel="noopener noreferrer" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-4 h-4 text-gold-muted" />
                    <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Prompt Database v2</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
                </a>
              ) : (
                <div className="flex justify-between p-5 bg-bg-light border border-border-light-subtle opacity-60 rounded-lg">
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-4 h-4 text-light-lo" />
                    <span className="font-body font-medium text-sm text-light-lo">Prompt Database v2</span>
                  </div>
                  <Lock className="w-4 h-4 text-light-lo" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Module Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
            <div className="bg-[#161412] border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 transform transition-all relative z-10">
              <h3 className="text-2xl font-bold font-sans text-dark-hi mb-1">{selectedModule.title}</h3>
              <p className="text-dark-md font-body mb-8 opacity-80">{selectedModule.subtitle}</p>
              
              <div className="space-y-4 mb-8">
                {selectedModule.materials.map((mat: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (mat.htmls) {
                        setSelectedHtmlData({ activeIndex: 0, htmls: mat.htmls });
                      } else if (mat.html) {
                        setSelectedHtmlData({ activeIndex: 0, htmls: [{ title: mat.title, content: mat.html }] });
                      }
                    }}
                    className="p-4 border border-border-dark-subtle/30 rounded-xl bg-bg-dark flex justify-between items-center group hover:border-gold/30 transition-all cursor-pointer"
                  >
                    <div>
                      {mat.day && <div className="font-mono text-xs text-gold-muted mb-1 font-bold">{mat.day}</div>}
                      <div className="font-sans font-medium text-dark-hi">{mat.title}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-md group-hover:text-gold-muted transition-colors" />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedModule(null)} 
                className="w-full py-3 bg-bg-dark border border-border-dark-subtle/30 text-dark-hi rounded-lg font-bold font-mono tracking-wider hover:bg-border-dark-subtle/20 transition-colors"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
        {/* Selected Html Modal */}
        {selectedHtmlData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
            <div className={`bg-[#161412] border border-border-dark-subtle/30 shadow-2xl w-full overflow-hidden p-0 transform transition-all relative z-[61] flex flex-col ${isFullscreen ? 'fixed inset-0 rounded-none max-w-none max-h-none h-screen' : 'rounded-2xl max-w-5xl max-h-[90vh]'}`}>
              <div className="flex flex-col border-b border-border-dark-subtle/30">
                <div className="flex justify-between items-center p-4">
                  <h3 className="text-xl font-bold font-sans text-dark-hi">Materi AI First</h3>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-dark-md hover:text-gold-muted transition-colors p-1" title={isFullscreen ? 'Kecilkan' : 'Layar Penuh'}>
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                    <button onClick={() => { setSelectedHtmlData(null); setIsFullscreen(false); }} className="text-dark-md hover:text-gold-muted transition-colors px-2 py-1">
                      <span className="font-mono text-sm tracking-wider uppercase">Tutup</span>
                    </button>
                  </div>
                </div>
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
                    {selectedHtmlData.htmls[selectedHtmlData.activeIndex].images?.map((img, idx) => (
                      <img key={idx} src={img} className="max-w-full rounded-lg shadow-md" alt="Materi" />
                    ))}
                  </div>
                ) : (
                  <iframe srcDoc={selectedHtmlData.htmls[selectedHtmlData.activeIndex].content} className="w-full h-full min-h-[70vh] border-0" title="Materi" />
                )}
              </div>
            </div>
          </div>
        )}
        {/* Timeline Modal */}
        {isTimelineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
            <div className="bg-[#161412] border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden p-0 sm:p-2 transform transition-all relative z-10 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-border-dark-subtle/30">
                <h3 className="text-xl font-bold font-sans text-dark-hi">Timeline Sesi Tatap Muka</h3>
                <button onClick={() => setIsTimelineModalOpen(false)} className="text-dark-md hover:text-gold-muted transition-colors">
                  <span className="font-mono text-sm tracking-wider uppercase">Tutup</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-black p-0">
                <iframe srcDoc={timelineHtml} className="w-full h-full min-h-[70vh] border-0" title="Timeline Sesi Tatap Muka" />
              </div>
            </div>
          </div>
        )}
        {/* Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
            <div className="bg-[#161412] border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 transform transition-all relative z-10">
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
                    className="flex-1 py-3 bg-gold-muted text-[#111] rounded-lg font-bold font-mono tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
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
              <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
                <Eyebrow variant="flat">SinaD Learning</Eyebrow>
                <div className="h-6"></div>
                <h1 className="font-sans font-bold text-3xl md:text-[42px] leading-[1.15] text-light-hi mb-4">
                  SinaD Portal
                </h1>
                <div className="flex items-center gap-3 mb-10">
                  <span className="inline-block px-3 py-1 rounded bg-bg-light-eyebrow border border-border-light-eyebrow text-gold-muted font-mono text-xs font-bold uppercase">
                    Role: {sinadAccess.tier}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Materi Access */}
                  {(sinadAccess.tier === 'Teacher' || (sinadAccess.tier === 'Student' && sinadAccess.materi) || isAdmin) ? (
                    <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <BookOpen className="w-6 h-6 text-gold" />
                           <div className="font-sans font-bold text-2xl text-light-hi group-hover:text-gold transition-colors">Materi</div>
                        </div>
                        <p className="font-body text-sm text-light-md mt-4">Akses semua materi pembelajaran yang tersedia di platform SinaD.</p>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ChevronRight className="w-5 h-5 text-light-lo group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border-light-subtle bg-bg-light p-6 md:p-8 rounded-xl opacity-60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <Lock className="w-6 h-6 text-light-lo" />
                           <div className="font-sans font-bold text-2xl text-light-md">Materi</div>
                        </div>
                        <p className="font-body text-sm text-light-md mt-4">Anda belum memiliki akses ke materi. Hubungi pengajar Anda.</p>
                      </div>
                    </div>
                  )}

                  {/* Exercise Access */}
                  {(sinadAccess.tier === 'Teacher' || (sinadAccess.tier === 'Student' && sinadAccess.exercise) || isAdmin) ? (
                    <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer group">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <FileText className="w-6 h-6 text-gold" />
                           <div className="font-sans font-bold text-2xl text-light-hi group-hover:text-gold transition-colors">Exercise</div>
                        </div>
                        <p className="font-body text-sm text-light-md mt-4">Kerjakan latihan soal dan ujian kompetensi Anda di sini.</p>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ChevronRight className="w-5 h-5 text-light-lo group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border-light-subtle bg-bg-light p-6 md:p-8 rounded-xl opacity-60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <Lock className="w-6 h-6 text-light-lo" />
                           <div className="font-sans font-bold text-2xl text-light-md">Exercise</div>
                        </div>
                        <p className="font-body text-sm text-light-md mt-4">Anda belum memiliki akses ke latihan soal. Hubungi pengajar Anda.</p>
                      </div>
                    </div>
                  )}
                </div>
              </main>
            )}
          </>
        ) : (
          <AdminView />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isMainAdmin = currentUser.email === 'stephen.tssgroup@gmail.com';
        if (!isMainAdmin) {
          try {
            const userDocRef = doc(db, 'members', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                await signOut(auth);
                setUser(null);
                setAuthInitialized(true);
                return;
              }
            }
          } catch (err) {
            console.error("Gagal memvalidasi sesi:", err);
          }
        }
      }
      setUser(currentUser);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-gold font-mono uppercase tracking-widest text-xs font-bold">Memuat...</div>;
  }

  return (
    <>
      {!user ? <LoginView /> : <DashboardView user={user} />}
    </>
  );
}