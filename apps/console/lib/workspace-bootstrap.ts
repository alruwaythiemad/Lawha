import { createSupabaseWorkspaceRepository } from '@lawha/adapters';
import type { Workspace } from '@lawha/domain';
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
