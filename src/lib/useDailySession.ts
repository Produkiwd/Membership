import { useEffect, useState } from 'react';
import { createDailySessionGuard, DAILY_SESSION_EVENT, dailySessionExpired, dailySessionKey, readDailySessionStart } from './dailySession';
import { signOutMember, type User } from './membership';

export function useDailySession(user: User | null) {
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState({ error: '', notice: '' });
  const userId = user?.id;
  const signedInAt = user?.last_sign_in_at;
  const expired = !!userId && dailySessionExpired(readDailySessionStart(userId, signedInAt), Date.now());
  useEffect(() => {
    const refresh = () => setRevision(previous => previous + 1);
    const storage = (event: StorageEvent) => { if (event.key === null || (userId && event.key === dailySessionKey(userId))) refresh(); };
    window.addEventListener(DAILY_SESSION_EVENT, refresh);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(DAILY_SESSION_EVENT, refresh); window.removeEventListener('storage', storage); };
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setStatus({ error: '', notice: '' });
    const guard = createDailySessionGuard(() => readDailySessionStart(userId, signedInAt), () => {
      setStatus({ error: '', notice: 'Hari telah berganti. Silakan login kembali.' });
      void signOutMember('local').catch(() => {
        if (mounted) setStatus({ error: 'Sesi hari sebelumnya sudah berakhir. Silakan login kembali.', notice: 'Hari telah berganti. Silakan login kembali.' });
      });
    });
    const check = () => guard.check();
    window.addEventListener('focus', check);
    window.addEventListener('pageshow', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      mounted = false; guard.stop();
      window.removeEventListener('focus', check);
      window.removeEventListener('pageshow', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [userId, signedInAt, revision]);
  return { expired, error: status.error, notice: status.notice };
}
