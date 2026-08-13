import { describe, expect, it } from 'vitest';
import type { Workspace, WorkspaceBootstrapResult, WorkspaceRepository } from '../src/workspace';
import { generateId } from '../src/id';

// The port has no runtime behavior of its own — this test exercises the
// interface shape via an in-memory fake, which also documents the exact
// contract packages/adapters' Supabase implementation (Task 5) must satisfy.
class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly memberships = new Map<string, WorkspaceBootstrapResult>();

  async findWorkspaceForClerkUser(clerkUserId: string): Promise<Workspace | null> {
    return this.memberships.get(clerkUserId)?.workspace ?? null;
  }

  async createWorkspaceWithDefaultBranch(clerkUserId: string): Promise<WorkspaceBootstrapResult> {
    const existing = this.memberships.get(clerkUserId);
    if (existing) return existing;

    const now = new Date();
    const workspace: Workspace = { id: generateId(), createdAt: now, updatedAt: now };
    const result: WorkspaceBootstrapResult = {
      workspace,
      branch: {
        id: generateId(),
        workspaceId: workspace.id,
        name: 'Main',
        address: null,
        createdAt: now,
        updatedAt: now,
      },
    };
    this.memberships.set(clerkUserId, result);
    return result;
  }
}

describe('WorkspaceRepository port', () => {
  it('returns null for a Clerk user with no workspace yet', async () => {
    const repo = new InMemoryWorkspaceRepository();
    await expect(repo.findWorkspaceForClerkUser('user_1')).resolves.toBeNull();
  });

  it('creates exactly one workspace and default branch per Clerk user (AC1)', async () => {
    const repo = new InMemoryWorkspaceRepository();
    const result = await repo.createWorkspaceWithDefaultBranch('user_1');
    expect(result.branch.workspaceId).toBe(result.workspace.id);

    const found = await repo.findWorkspaceForClerkUser('user_1');
    expect(found?.id).toBe(result.workspace.id);
  });

  it('repeat sign-in resolves to the same workspace, never a new one (AC2)', async () => {
    const repo = new InMemoryWorkspaceRepository();
    const first = await repo.createWorkspaceWithDefaultBranch('user_1');
    const second = await repo.createWorkspaceWithDefaultBranch('user_1');
    expect(second.workspace.id).toBe(first.workspace.id);
  });
});
