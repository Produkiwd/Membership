import assert from 'node:assert/strict';
import test from 'node:test';
import { createDailySessionGuard, dailySessionExpired, nextSessionMidnight, sessionDay } from './dailySession';
const time = (value: string) => Date.parse(value);

test('Midnight uses UTC+7 rather than UTC or the computer timezone', () => {
  const before = time('2026-10-09T16:59:59.999Z');
  const after = time('2026-10-09T17:00:00.000Z');
  assert.equal(sessionDay(after), sessionDay(before) + 1);
  assert.equal(nextSessionMidnight(before), after);
});
test('Same day stays active; midnight expires even a recent sign-in', () => {
  const start = time('2026-10-09T16:59:30Z');
  assert.equal(dailySessionExpired(start, time('2026-10-09T16:59:59Z')), false);
  assert.equal(dailySessionExpired(start, time('2026-10-09T17:00:00Z')), true);
});
test('Old sessions expire after sleep or multiple days away', () => assert.equal(dailySessionExpired(time('2026-10-09T08:00:00Z'), time('2026-10-12T08:00:00Z')), true));
test('Invalid, absent, and future sign-in timestamps deny the session', () => {
  const now = time('2026-10-09T08:00:00Z');
  for (const start of [NaN, 0, Infinity, now + 1]) assert.equal(dailySessionExpired(start, now), true);
});
test('Month and year boundaries expire correctly', () => {
  assert.equal(dailySessionExpired(time('2026-10-31T16:59:59Z'), time('2026-10-31T17:00:00Z')), true);
  assert.equal(dailySessionExpired(time('2026-12-31T16:59:59Z'), time('2026-12-31T17:00:00Z')), true);
});
function harness(start: number, current: number) {
  let now = current, nextId = 0, expires = 0;
  const timers = new Map<number, { callback: () => void; delay: number }>();
  const clock = {
    now: () => now,
    schedule: (callback: () => void, delay: number) => { const id = ++nextId; timers.set(id, { callback, delay }); return id as unknown as ReturnType<typeof setTimeout>; },
    cancel: (timer: ReturnType<typeof setTimeout>) => { timers.delete(timer as unknown as number); },
  };
  const guard = createDailySessionGuard(() => start, () => { expires++; }, clock);
  return { guard, timers, expired: () => expires, setNow: (value: number) => { now = value; }, setStart: (value: number) => { start = value; } };
}
test('Timer logs out once at the exact midnight boundary', () => {
  const midnight = time('2026-10-09T17:00:00Z');
  const h = harness(midnight - 1000, midnight - 100);
  const pending = [...h.timers.values()][0]; assert.equal(pending.delay, 100);
  h.setNow(midnight); pending.callback(); h.guard.check();
  assert.equal(h.expired(), 1); assert.equal(h.timers.size, 0);
});
test('Focus/visibility check expires a suspended tab immediately', () => {
  const h = harness(time('2026-10-09T08:00:00Z'), time('2026-10-09T09:00:00Z'));
  h.setNow(time('2026-10-10T09:00:00Z')); h.guard.check(); h.guard.check();
  assert.equal(h.expired(), 1);
});
test('Reloading an expired saved session does not extend its day', () => {
  const h = harness(time('2026-10-09T08:00:00Z'), time('2026-10-10T08:00:00Z'));
  assert.equal(h.expired(), 1); assert.equal(h.timers.size, 0);
});
test('A new login uses the new day without inheriting the old deadline', () => {
  const now = time('2026-10-10T08:00:00Z'); const h = harness(now, now);
  h.guard.check(); assert.equal(h.expired(), 0); assert.equal(h.timers.size, 1); h.guard.stop();
});
test('Stopping the guard cancels timers and prevents further logout', () => {
  const h = harness(time('2026-10-09T08:00:00Z'), time('2026-10-09T08:00:00Z'));
  h.guard.stop(); h.setNow(time('2026-10-10T08:00:00Z')); h.guard.check();
  assert.equal(h.expired(), 0); assert.equal(h.timers.size, 0);
});

test('Default clock calls browser timers without an incompatible receiver', async () => {
  const { readFileSync } = await import('node:fs');
  const { runInNewContext } = await import('node:vm');
  const ts = await import('typescript');
  const source = readFileSync(new URL('./dailySession.ts', import.meta.url), 'utf8');
  const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  let scheduled = 0, cancelled = 0;
  const exports: Record<string, any> = {};
  // Window timers reject an object receiver. Node's timers otherwise hide this browser error.
  runInNewContext(javascript, { exports, Date,
    setTimeout: function (this: unknown) { assert.equal(this, undefined); scheduled++; return 1; },
    clearTimeout: function (this: unknown) { assert.equal(this, undefined); cancelled++; },
  });
  const guard = exports.createDailySessionGuard(() => Date.now(), () => assert.fail('Current session must remain active'));
  guard.check(); guard.stop();
  assert.equal(scheduled, 2);
  assert.equal(cancelled, 2);
});
