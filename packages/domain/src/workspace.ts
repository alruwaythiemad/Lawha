// Mirrors packages/i18n's Locale ('en' | 'ar', packages/i18n/src/locale.ts)
// exactly, but is not imported from there: ARCHITECTURE-SPINE's dependency
// direction diagram states packages/domain "is a sink with no outgoing
// edges" — that's a binding invariant this story's own Task 2 guidance
// (which suggested importing Locale from '@lawha/i18n') would violate, so
// this local duplicate keeps the sink property intact instead. Widen both
// definitions together if a third locale is ever added.
export type Locale = 'en' | 'ar';

export interface Workspace {
  id: string;
  language: Locale;
  createdAt: Date;
  updatedAt: Date;
}

// The result of the atomic create-workspace-with-default-branch operation
// (Task 5's transactional write) — workspace, membership, and default
// branch all succeed or all fail together.
export interface WorkspaceBootstrapResult {
  workspace: Workspace;
  branch: import('./branch').Branch;
}

// Narrow port (AD-1/AD-2: no vendor SDK import here) for exactly the two
// operations this story needs. packages/adapters implements this against
// Supabase.
export interface WorkspaceRepository {
  // AC2: repeat sign-in must resolve to the same workspace — a single
  // indexed lookup on the Clerk user's membership.
  findWorkspaceForClerkUser(clerkUserId: string): Promise<Workspace | null>;

  // AC1: exactly one workspace + one default branch created per new
  // account, atomically. Idempotent under concurrent first-sign-in retries
  // via a uniqueness constraint on the membership row (Task 5), not an
  // application-level check-then-insert race.
  createWorkspaceWithDefaultBranch(clerkUserId: string): Promise<WorkspaceBootstrapResult>;

  // AD-27: takes workspaceId as a required argument, resolved by the caller
  // from the session (never a request param) — Story 1.6's demonstration of
  // the pattern every later workspace-scoped read/write function follows.
  findWorkspaceById(workspaceId: string): Promise<Workspace | null>;

  // Story 1.7: the write side of the persisted-language-preference feature
  // (AC1). Same AD-27-shaped signature as findWorkspaceById.
  updateWorkspaceLanguage(workspaceId: string, language: Locale): Promise<Workspace>;
}
