import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }));

const ensureWorkspaceForClerkUserMock = vi.fn();
vi.mock('./workspace-bootstrap', () => ({
  ensureWorkspaceForClerkUser: (clerkUserId: string) => ensureWorkspaceForClerkUserMock(clerkUserId),
}));

const { resolveWorkspaceContext } = await import('./workspace-context');

describe('resolveWorkspaceContext', () => {
  it('throws an UNAUTHENTICATED ApiError when no session exists', async () => {
    authMock.mockResolvedValue({ userId: null });

    await expect(resolveWorkspaceContext()).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
      messageKey: 'error.unauthenticated',
      status: 401,
    });
    expect(ensureWorkspaceForClerkUserMock).not.toHaveBeenCalled();
  });

  it('resolves { workspaceId, clerkUserId } from the session via ensureWorkspaceForClerkUser, never a request param', async () => {
    authMock.mockResolvedValue({ userId: 'user_1' });
    ensureWorkspaceForClerkUserMock.mockResolvedValue({
      id: 'workspace_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const context = await resolveWorkspaceContext();

    expect(context).toEqual({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });
    expect(ensureWorkspaceForClerkUserMock).toHaveBeenCalledWith('user_1');
  });
});
