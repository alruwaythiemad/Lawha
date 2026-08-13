import { describe, expect, it } from 'vitest';
import type { Locale, Workspace, WorkspaceBootstrapResult, WorkspaceRepository } from '../src/workspace';
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
    const workspace: Workspace = { id: generateId(), language: 'en', createdAt: now, updatedAt: now };
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

  async findWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    for (const { workspace } of this.memberships.values()) {
      if (workspace.id === workspaceId) return workspace;
    }
    return null;
  }

  async updateWorkspaceLanguage(workspaceId: string, language: Locale): Promise<Workspace> {
    for (const result of this.memberships.values()) {
      if (result.workspace.id === workspaceId) {
        result.workspace = { ...result.workspace, language, updatedAt: new Date() };
        return result.workspace;
      }
    }
    throw new Error(`updateWorkspaceLanguage: no workspace ${workspaceId}`);
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

  it('updateWorkspaceLanguage persists the new language on the workspace (Story 1.7 AC1)', async () => {
    const repo = new InMemoryWorkspaceRepository();
    const { workspace } = await repo.createWorkspaceWithDefaultBranch('user_1');
    expect(workspace.language).toBe('en');

    const updated = await repo.updateWorkspaceLanguage(workspace.id, 'ar');
    expect(updated.language).toBe('ar');

    const found = await repo.findWorkspaceById(workspace.id);
    expect(found?.language).toBe('ar');
  });

  it('findWorkspaceById looks up by workspace id, not by Clerk user (AD-27)', async () => {
    const repo = new InMemoryWorkspaceRepository();
    const { workspace: workspaceA } = await repo.createWorkspaceWithDefaultBranch('user_1');
    const { workspace: workspaceB } = await repo.createWorkspaceWithDefaultBranch('user_2');

    await expect(repo.findWorkspaceById(workspaceA.id)).resolves.toEqual(workspaceA);
    await expect(repo.findWorkspaceById(workspaceB.id)).resolves.toEqual(workspaceB);
    await expect(repo.findWorkspaceById('user_1')).resolves.toBeNull();
    await expect(repo.findWorkspaceById('nonexistent')).resolves.toBeNull();
  });
});
