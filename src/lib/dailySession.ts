const DAY_MS = 24 * 60 * 60 * 1000;
const UTC_PLUS_SEVEN = 7 * 60 * 60 * 1000;
export const DAILY_SESSION_EVENT = 'sinau:session-started';
export const dailySessionKey = (userId: string) => `sinau.daily-session.v1:${userId}`;

export function sessionDay(timestamp: number): number {
  return Math.floor((timestamp + UTC_PLUS_SEVEN) / DAY_MS);
}
export function dailySessionExpired(startedAt: number, now: number): boolean {
  return !Number.isFinite(startedAt) || startedAt <= 0 || startedAt > now || sessionDay(startedAt) !== sessionDay(now);
}
export function nextSessionMidnight(now: number): number {
  return (sessionDay(now) + 1) * DAY_MS - UTC_PLUS_SEVEN;
}
export function markDailySession(userId: string, now = Date.now()) {
  try { localStorage.setItem(dailySessionKey(userId), String(now)); } catch { /* Supabase sign-in time is the fallback when storage is unavailable. */ }
  window.dispatchEvent(new Event(DAILY_SESSION_EVENT));
}
export function readDailySessionStart(userId: string, signedInAt?: string): number {
  try {
    const saved = localStorage.getItem(dailySessionKey(userId));
    if (saved !== null) return Number(saved);
  } catch { /* Use the persisted auth user's sign-in time. */ }
  return signedInAt ? Date.parse(signedInAt) : NaN;
}

type Clock = { now: () => number; schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>; cancel: (timer: ReturnType<typeof setTimeout>) => void };
// Browser timers must be called as globals, not with the Clock object as their receiver.
const defaultClock: Clock = {
  now: () => Date.now(),
  schedule: (callback, delay) => setTimeout(callback, delay),
  cancel: timer => clearTimeout(timer),
};
export function createDailySessionGuard(readStart: () => number, onExpire: () => void, clock: Clock = defaultClock) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  const cancel = () => { if (timer !== undefined) clock.cancel(timer); timer = undefined; };
  const check = () => {
    if (stopped) return;
    cancel();
    const now = clock.now();
    if (dailySessionExpired(readStart(), now)) { stopped = true; onExpire(); return; }
    // Also check every minute to handle clock changes and suspended browser timers.
    timer = clock.schedule(check, Math.min(60_000, nextSessionMidnight(now) - now));
  };
  check();
  return { check, stop: () => { stopped = true; cancel(); } };
}
