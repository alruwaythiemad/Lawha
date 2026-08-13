import { auth } from '@clerk/nextjs/server';
import { createSupabaseWorkspaceRepository } from '@lawha/adapters';
import type { Locale, Workspace } from '@lawha/domain';
import { env } from './env';

// AD-27: the only place a service-role Supabase client is constructed for
// the console app — confined behind packages/adapters, reached only from
// here (a server-only module: this file must never be imported from a
// 'use client' component, per AD-20).
const workspaceRepository = createSupabaseWorkspaceRepository(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

// Called synchronously at request time from the (console) layout, right
// after auth.protect() confirms a session exists. No webhook/background-job
// path exists for this (AD-13 forbids background jobs) — this is the
// idempotent check-or-create that satisfies both AC1 (new account gets
// exactly one workspace + default branch) and AC2 (repeat sign-in lands in
// the same one, never a new one).
export async function ensureWorkspaceForClerkUser(clerkUserId: string): Promise<Workspace> {
  const existing = await workspaceRepository.findWorkspaceForClerkUser(clerkUserId);
  if (existing) return existing;

  const { workspace } = await workspaceRepository.createWorkspaceWithDefaultBranch(clerkUserId);
  return workspace;
}

// AD-27: Story 1.6's demonstration of the workspace-scoped data-access
// pattern — takes workspaceId as a required argument, never resolves it
// itself. The caller (a route handler, via resolveWorkspaceContext()) is
// responsible for sourcing workspaceId from the session.
export async function findWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  return workspaceRepository.findWorkspaceById(workspaceId);
}

// Story 1.7: the data-access function backing Task 4's write route — same
// thin-wrapper, AD-27-shaped pattern as findWorkspaceById above.
export async function updateWorkspaceLanguage(workspaceId: string, language: Locale): Promise<Workspace> {
  return workspaceRepository.updateWorkspaceLanguage(workspaceId, language);
}

// Review fix (Story 1.7 AC1): the (console) layout can't hand its own
// `workspace` down to sibling page.tsx Server Components (Next.js doesn't
// pass layout-resolved data to routed children), so every page that needs
// `resolveLocale(workspace.language)` — not just the layout's nav/header —
// repeats the same "who's signed in, which workspace" composition. Centralized
// here rather than duplicated seven times across apps/console/app/(console)/*/page.tsx.
export async function resolveSignedInWorkspace(): Promise<Workspace> {
  const { userId } = await auth();
  if (!userId) throw new Error('resolveSignedInWorkspace: no Clerk session');
  return ensureWorkspaceForClerkUser(userId);
}
