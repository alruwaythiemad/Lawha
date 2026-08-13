import { redirect } from 'next/navigation';

// Screens is the IA's designated "Home" (surface-inventory.md). This can't
// be app/(console)/page.tsx at `/` directly — that would conflict with this
// file resolving to the same path (Next.js route-groups "conflicting
// paths" caveat).
export default function HomePage() {
  redirect('/screens');
}
