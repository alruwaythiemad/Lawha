// Backing store for the shell's one global status announcer (AC3,
// EXPERIENCE.md → Accessibility Floor). A plain external store (not React
// context) on purpose: `StatusAnnouncer` is mounted as a source-order
// sibling of `<header>`/the nav+main wrapper in layout.tsx, not as a
// provider wrapping them — so components inside `<header>` (e.g. the
// language/theme switches) must be able to call `announce`/`announceAlert`
// without being nested under a context provider that sits later in the
// tree. Module-scoped state is safe here because it is only ever mutated
// from client-side event handlers/effects, never during server rendering.

interface AnnouncerState {
  status: string;
  alert: string;
}

const EMPTY_STATE: AnnouncerState = { status: '', alert: '' };

let state: AnnouncerState = EMPTY_STATE;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

// Force a DOM text mutation even when the same message repeats
// back-to-back — role="status"/role="alert" regions are only announced by
// a screen reader on a text-content change, so re-assigning the identical
// string would otherwise be silently swallowed.
function nextMessage(previous: string, message: string): string {
  return previous === message ? `${message}\u200B` : message;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): AnnouncerState {
  return state;
}

export function announce(message: string): void {
  // This module has no 'use client' boundary of its own, so it's importable
  // from server code. `state` is a process-wide singleton — mutating it
  // during SSR would leak one user's announcement into another concurrent
  // request's render. Guard here rather than trusting every future call
  // site to know this file is client-only.
  if (typeof window === 'undefined') return;
  state = { ...state, status: nextMessage(state.status, message) };
  emit();
}

export function announceAlert(message: string): void {
  if (typeof window === 'undefined') return;
  state = { ...state, alert: nextMessage(state.alert, message) };
  emit();
}

interface StatusAnnouncerHandle {
  announce: (message: string) => void;
  announceAlert: (message: string) => void;
}

// Stable across renders (module-level function references) — safe to call
// straight from event handlers without a useCallback dependency dance.
export function useStatusAnnouncer(): StatusAnnouncerHandle {
  return { announce, announceAlert };
}
