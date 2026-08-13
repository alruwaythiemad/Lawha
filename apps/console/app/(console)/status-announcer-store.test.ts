import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { announce, announceAlert, getSnapshot, subscribe } from './status-announcer-store';

// announce()/announceAlert() guard against SSR via `typeof window ===
// 'undefined'`. Vitest's default environment is Node (no `window`), so stub
// a minimal global for the duration of these tests — this file exercises
// client-side behavior, not the SSR guard itself (see the last test below).
beforeEach(() => {
  (globalThis as { window?: unknown }).window = {};
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('status-announcer-store', () => {
  it('announce() updates status and notifies subscribers', () => {
    let notified = false;
    const unsubscribe = subscribe(() => {
      notified = true;
    });

    announce('Saved');

    expect(notified).toBe(true);
    expect(getSnapshot().status.replace(/\u200B$/, '')).toBe('Saved');
    unsubscribe();
  });

  it('announceAlert() updates alert independently of status', () => {
    announce('Saved');
    announceAlert('Rollback failed');

    const snapshot = getSnapshot();
    expect(snapshot.alert.replace(/\u200B$/, '')).toBe('Rollback failed');
    expect(snapshot.status.replace(/\u200B$/, '')).toBe('Saved');
  });

  it('repeating the same status message back-to-back still changes the snapshot (zero-width-space dedup)', () => {
    announce('Updated');
    const first = getSnapshot().status;

    announce('Updated');
    const second = getSnapshot().status;

    expect(second).not.toBe(first);
    expect(second.replace(/\u200B$/, '')).toBe('Updated');
  });

  it('repeating the same alert message back-to-back still changes the snapshot', () => {
    announceAlert('Failed');
    const first = getSnapshot().alert;

    announceAlert('Failed');
    const second = getSnapshot().alert;

    expect(second).not.toBe(first);
  });

  it('unsubscribe stops further notifications', () => {
    let callCount = 0;
    const unsubscribe = subscribe(() => {
      callCount += 1;
    });

    announce('First');
    unsubscribe();
    announce('Second');

    expect(callCount).toBe(1);
  });

  it('does not mutate state when window is undefined (SSR guard)', () => {
    delete (globalThis as { window?: unknown }).window;

    const before = getSnapshot();
    announce('Should be ignored');
    const after = getSnapshot();

    expect(after).toBe(before);
  });
});
