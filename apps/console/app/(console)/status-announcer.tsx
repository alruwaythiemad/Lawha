'use client';

import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from './status-announcer-store';

// One global status announcer (AC3, EXPERIENCE.md → Accessibility Floor):
// role="status" + aria-atomic="true" (aria-live="polite" is role="status"'s
// implicit value — never overridden) for ordinary state changes, and
// role="alert" (implicit aria-live="assertive") reserved for
// optimistic-rollback failures alone (EXPERIENCE.md → Truth Contract).
// Visually hidden (`sr-only`) — this is an accessibility-tree-only surface,
// not a visible toast.
export function StatusAnnouncer() {
  const { status, alert } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <>
      <div role="status" aria-atomic="true" className="sr-only">
        {status}
      </div>
      <div role="alert" className="sr-only">
        {alert}
      </div>
    </>
  );
}
