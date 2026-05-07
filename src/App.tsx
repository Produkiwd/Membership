import { signInWithEmailAndPassword, createUserWithEmailAndPassword, secondaryAuth, auth, signOut, handleFirestoreError, OperationType } from './lib/firebase';
import { BookOpen, Calendar, ChevronRight, FileText, Lock, LogOut, Video, Key } from 'lucide-react';
import { useState, useEffect, type ReactNode, type ButtonHTMLAttributes, type FormEvent } from 'react';
import { cn } from './lib/utils';
import { onAuthStateChanged, type User, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, updateDoc, Timestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

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
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle rounded text-dark-hi placeholder:text-dark-lo focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              disabled={isLoading}
            />
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

function MemberRow({ mb, isUpdating, handleUpdate }: { key?: string | number, mb: any, isUpdating: boolean, handleUpdate: (id: string, role: string, tier: string, exp: string) => void }) {
  const [tier, setTier] = useState(mb.tier || 'Normal');
  const [role, setRole] = useState(mb.role || 'member');
  const currentExp = mb.expiresAt ? mb.expiresAt.toDate().toISOString().split('T')[0] : '';
  const [exp, setExp] = useState(currentExp);
  
  let sisaWaktu = 'Selamanya';
  if (mb.expiresAt) {
    const diffTime = mb.expiresAt.toDate().getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    sisaWaktu = diffDays > 0 ? `${diffDays} hari lagi` : 'Kedaluwarsa';
  }
  
  return (
    <tr className="border-b border-border-light-subtle/50">
      <td className="py-3 px-2 font-mono text-xs">{mb.email}</td>
      <td className="py-3 px-2">
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)}
          className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="py-3 px-2">
        <select 
          value={tier} 
          onChange={e => setTier(e.target.value)}
          className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted"
        >
          <option value="Normal">Normal</option>
          <option value="Professional">Professional</option>
          <option value="Leader">Leader</option>
        </select>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={exp}
            onChange={e => setExp(e.target.value)}
            className="border border-border-light-subtle rounded px-2 py-1 bg-transparent block w-full focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted"
          />
        </div>
      </td>
      <td className="py-3 px-2 text-xs">
        <span className={cn("px-2 py-1 rounded inline-block", sisaWaktu === 'Selamanya' ? 'bg-green-100 text-green-700' : sisaWaktu === 'Kedaluwarsa' ? 'bg-red-100 text-red-700' : 'bg-gold-muted/20 text-gold-muted font-semibold')}>
           {sisaWaktu}
        </span>
      </td>
      <td className="py-3 px-2">
        <Button 
          disabled={isUpdating}
          onClick={() => handleUpdate(mb.id, role, tier, exp)}
          variant="primary" 
          className="py-1.5 px-4 text-[10px]"
        >
          Simpan
        </Button>
      </td>
    </tr>
  );
}

function AdminView() {
  const [members, setMembers] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (sn) => {
      setMembers(sn.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Gagal mendapatkan member", error);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (memberId: string, role: string, newTier: string, expiresAtStr: string) => {
    setIsUpdating(true);
    try {
      const ref = doc(db, 'members', memberId);
      const updateData: any = { role, tier: newTier, updatedAt: serverTimestamp() };
      
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
        tier: 'Normal',
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
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 border border-border-light-subtle rounded text-light-hi placeholder:text-light-lo focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-all"
              disabled={isCreating}
            />
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
        <h3 className="font-sans font-bold text-xl text-light-hi mb-2">Daftar Member</h3>
        <p className="font-body text-sm text-light-md mb-6">Atur role, tingkat keanggotaan (Tier), dan batas waktu akses (Expires At). Kosongkan tanggal jika akses selamanya.</p>
        
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-border-light-subtle">
              <th className="py-3 px-2 font-bold text-light-hi">Email</th>
              <th className="py-3 px-2 font-bold text-light-hi w-28">Role</th>
              <th className="py-3 px-2 font-bold text-light-hi w-32">Tier</th>
              <th className="py-3 px-2 font-bold text-light-hi min-w-[200px]">Atur Waktu (Kedaluwarsa)</th>
              <th className="py-3 px-2 font-bold text-light-hi">Sisa Waktu</th>
              <th className="py-3 px-2 font-bold text-light-hi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 px-2 text-light-md text-center">Memuat data...</td>
              </tr>
            )}
            {members.map(mb => (
              <MemberRow key={mb.id} mb={mb} isUpdating={isUpdating} handleUpdate={handleUpdate} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function DashboardView({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(user.email === 'stephen.tssgroup@gmail.com');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
    const fetchRole = async () => {
      try {
        const docRef = doc(db, 'members', user.uid);
        const sn = await getDoc(docRef);
        if (sn.exists()) {
          const data = sn.data();
          if (data.role === 'admin') setIsAdmin(true);
        }
      } catch (err) {
        console.error("Gagal mendapatkan role", err);
      }
    };
    fetchRole();
  }, [user.uid]);

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
          AIF Community <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
        </div>
        <div className="flex items-center gap-6">
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
            <h2 className="font-sans font-bold text-xl text-light-hi">Progress Insight</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "01", title: "Strategize", subtitle: "Awareness Session", materials: [{ title: "Materi Sesi Penuh" }] })}>
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
            
            <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "02", title: "Prompt", subtitle: "Chat Mastery", materials: [{ day: "Day 1", title: "Materi Day 1" }, { day: "Day 2", title: "Materi Day 2" }] })}>
               <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">02</span>
              <div>
                <div className="font-sans font-bold text-lg text-light-hi mb-2">Prompt</div>
                <p className="font-body text-sm text-light-md">Chat Mastery</p>
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full w-[50%]"></div>
                   </div>
                   <span className="font-mono text-xs text-light-lo">50%</span>
                </div>
              </div>
            </div>

            <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "03", title: "Create", subtitle: "Output Creation", materials: [{ day: "Day 1", title: "Materi Day 1" }, { day: "Day 2", title: "Materi Day 2" }] })}>
               <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">03</span>
              <div>
                <div className="font-sans font-bold text-lg text-light-hi mb-2">Create</div>
                <p className="font-body text-sm text-light-md">Output Creation</p>
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full w-[0%]"></div>
                   </div>
                   <span className="font-mono text-xs text-light-lo">0%</span>
                </div>
              </div>
            </div>
            
            <div className="border border-border-light-card bg-white p-6 md:p-8 rounded-xl shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors cursor-pointer" onClick={() => setSelectedModule({ id: "04", title: "Build", subtitle: "NoCode AI Build", materials: [{ day: "Day 1", title: "Materi Day 1" }, { day: "Day 2", title: "Materi Day 2" }] })}>
               <span className="font-mono text-[10px] font-bold text-gold-muted tracking-eyebrow uppercase mb-6 block">04</span>
              <div>
                <div className="font-sans font-bold text-lg text-light-hi mb-2">Build</div>
                <p className="font-body text-sm text-light-md">NoCode AI Build</p>
                <div className="mt-6 flex items-center gap-3">
                   <div className="flex-1 bg-border-light-subtle h-1 rounded-full overflow-hidden">
                      <div className="bg-gold h-full rounded-full w-[0%]"></div>
                   </div>
                   <span className="font-mono text-xs text-light-lo">0%</span>
                </div>
              </div>
            </div>
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
              <div className="group bg-white border border-border-light-card p-6 md:p-8 rounded-xl shadow-card flex flex-col sm:flex-row gap-6 lg:gap-8 items-start sm:items-center hover:border-gold/30 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-bg-light border border-border-light-subtle flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-gold-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-lg text-light-hi mb-2 group-hover:text-gold-muted transition-colors">Arsitektur Microservices Eksekusi</h3>
                  <p className="font-body text-sm text-light-md">Pola komunikasi, manajemen state, dan saga.</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 font-mono text-xs text-gold-muted tracking-eyebrow font-bold uppercase">
                  Lanjutkan <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

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
              <a href="#" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                <div className="flex items-center gap-4">
                  <Calendar className="w-4 h-4 text-gold-muted" />
                  <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Sesi Tatap Muka</span>
                </div>
                <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
              </a>
              <a href="#" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                <div className="flex items-center gap-4">
                  <Video className="w-4 h-4 text-gold-muted" />
                  <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Pustaka Rekaman</span>
                </div>
                <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
              </a>
              <a href="#" className="flex justify-between p-5 bg-white border border-border-light-card rounded-lg hover:border-border-light-subtle transition-colors group">
                <div className="flex items-center gap-4">
                  <FileText className="w-4 h-4 text-gold-muted" />
                  <span className="font-body font-medium text-sm text-light-hi group-hover:text-gold-muted transition-colors">Arsip Arsitektur</span>
                </div>
                <ChevronRight className="w-4 h-4 text-light-lo group-hover:text-light-md transition-colors" />
              </a>
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
                  <div key={idx} className="p-4 border border-border-dark-subtle/30 rounded-xl bg-bg-dark flex justify-between items-center group hover:border-gold/30 transition-all cursor-pointer">
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
        {/* Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a09]/80 backdrop-blur-sm">
            <div className="bg-[#161412] border border-border-dark-subtle/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 transform transition-all relative z-10">
              <h3 className="text-2xl font-bold font-sans text-dark-hi mb-6">Ganti Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium font-sans text-dark-md mb-2">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-dark border border-border-dark-subtle text-dark-hi rounded-lg focus:outline-none focus:border-gold-muted focus:ring-1 focus:ring-gold-muted transition-colors font-body"
                    placeholder="Minimal 6 karakter"
                    required
                  />
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