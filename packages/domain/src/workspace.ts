export interface Workspace {
  id: string;
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
}
