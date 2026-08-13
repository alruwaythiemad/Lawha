import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../locale-cookie', () => ({
  resolveLocale: vi.fn().mockResolvedValue('en'),
}));

const resolveWorkspaceContextMock = vi.fn();
vi.mock('../../../lib/workspace-context', () => ({
  resolveWorkspaceContext: () => resolveWorkspaceContextMock(),
}));

const findWorkspaceByIdMock = vi.fn();
vi.mock('../../../lib/workspace-bootstrap', () => ({
  findWorkspaceById: (workspaceId: string) => findWorkspaceByIdMock(workspaceId),
}));

const { GET } = await import('./route');

describe('GET /api/workspace', () => {
  beforeEach(() => {
    resolveWorkspaceContextMock.mockReset();
    findWorkspaceByIdMock.mockReset();
  });

  it('returns the resolved workspace as { id, createdAt } on success', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    findWorkspaceByIdMock.mockResolvedValue({ id: 'workspace_1', createdAt, updatedAt: createdAt });

    const response = await GET(new Request('http://localhost/api/workspace'));

    expect(findWorkspaceByIdMock).toHaveBeenCalledWith('workspace_1');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'workspace_1', createdAt: createdAt.toISOString() });
  });

  it('maps a missing workspace to the honest WORKSPACE_NOT_FOUND 404 contract', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_missing', clerkUserId: 'user_1' });
    findWorkspaceByIdMock.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/workspace'));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      code: 'WORKSPACE_NOT_FOUND',
      message: "We couldn't find your workspace. Try signing in again.",
    });
  });

  it('maps an unauthenticated session to the UNAUTHENTICATED 401 contract, never calling findWorkspaceById', async () => {
    const { ApiError } = await import('../../../lib/api-error');
    resolveWorkspaceContextMock.mockRejectedValue(
      new ApiError({ code: 'UNAUTHENTICATED', messageKey: 'error.unauthenticated', status: 401 }),
    );

    const response = await GET(new Request('http://localhost/api/workspace'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      code: 'UNAUTHENTICATED',
      message: "You're signed out. Sign in to continue.",
    });
    expect(findWorkspaceByIdMock).not.toHaveBeenCalled();
  });
});
