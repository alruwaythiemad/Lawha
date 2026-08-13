import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../locale-cookie', () => ({
  resolveLocale: vi.fn().mockResolvedValue('en'),
}));

const resolveWorkspaceContextMock = vi.fn();
vi.mock('../../../../lib/workspace-context', () => ({
  resolveWorkspaceContext: () => resolveWorkspaceContextMock(),
}));

const updateWorkspaceLanguageMock = vi.fn();
vi.mock('../../../../lib/workspace-bootstrap', () => ({
  updateWorkspaceLanguage: (workspaceId: string, language: string) =>
    updateWorkspaceLanguageMock(workspaceId, language),
}));

const { PATCH } = await import('./route');

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/workspace/language', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/workspace/language', () => {
  beforeEach(() => {
    resolveWorkspaceContextMock.mockReset();
    updateWorkspaceLanguageMock.mockReset();
  });

  it('persists a valid language and returns { id, language } on success', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    updateWorkspaceLanguageMock.mockResolvedValue({ id: 'workspace_1', language: 'ar', createdAt, updatedAt: createdAt });

    const response = await PATCH(patchRequest({ language: 'ar' }));

    expect(updateWorkspaceLanguageMock).toHaveBeenCalledWith('workspace_1', 'ar');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'workspace_1', language: 'ar' });
  });

  it('rejects a language outside en/ar with the honest VALIDATION_FAILED 400 contract', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });

    const response = await PATCH(patchRequest({ language: 'fr' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: 'VALIDATION_FAILED',
      message: "That's not a supported language. Choose English or Arabic.",
    });
    expect(updateWorkspaceLanguageMock).not.toHaveBeenCalled();
  });

  it('rejects a missing/malformed body the same way as an invalid language', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });

    const response = await PATCH(new Request('http://localhost/api/workspace/language', { method: 'PATCH' }));

    expect(response.status).toBe(400);
    expect(updateWorkspaceLanguageMock).not.toHaveBeenCalled();
  });

  it('maps an unauthenticated session to the UNAUTHENTICATED 401 contract, never calling updateWorkspaceLanguage', async () => {
    const { ApiError } = await import('../../../../lib/api-error');
    resolveWorkspaceContextMock.mockRejectedValue(
      new ApiError({ code: 'UNAUTHENTICATED', messageKey: 'error.unauthenticated', status: 401 }),
    );

    const response = await PATCH(patchRequest({ language: 'en' }));

    expect(response.status).toBe(401);
    expect(updateWorkspaceLanguageMock).not.toHaveBeenCalled();
  });
});
