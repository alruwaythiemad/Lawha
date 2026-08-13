import { beforeEach, describe, expect, it, vi } from 'vitest';

const setLocaleMock = vi.fn();
vi.mock('../locale-cookie', () => ({
  setLocale: (locale: string) => setLocaleMock(locale),
}));

const setThemeMock = vi.fn();
vi.mock('../theme-cookie', () => ({
  setTheme: (theme: string) => setThemeMock(theme),
}));

const resolveWorkspaceContextMock = vi.fn();
vi.mock('../../lib/workspace-context', () => ({
  resolveWorkspaceContext: () => resolveWorkspaceContextMock(),
}));

const updateWorkspaceLanguageMock = vi.fn();
vi.mock('../../lib/workspace-bootstrap', () => ({
  updateWorkspaceLanguage: (workspaceId: string, language: string) =>
    updateWorkspaceLanguageMock(workspaceId, language),
}));

const { setLocaleAction } = await import('./actions');

describe('setLocaleAction', () => {
  beforeEach(() => {
    setLocaleMock.mockReset();
    resolveWorkspaceContextMock.mockReset();
    updateWorkspaceLanguageMock.mockReset();
  });

  it('sets the cookie synchronously (AC4) then persists to the workspace (AC1), returning persisted: true on success', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });
    updateWorkspaceLanguageMock.mockResolvedValue({ id: 'workspace_1', language: 'ar' });

    const result = await setLocaleAction('ar');

    expect(setLocaleMock).toHaveBeenCalledWith('ar');
    expect(updateWorkspaceLanguageMock).toHaveBeenCalledWith('workspace_1', 'ar');
    expect(result).toEqual({ persisted: true });
  });

  it('still sets the cookie but reports persisted: false when the workspace write fails', async () => {
    resolveWorkspaceContextMock.mockResolvedValue({ workspaceId: 'workspace_1', clerkUserId: 'user_1' });
    updateWorkspaceLanguageMock.mockRejectedValue(new Error('db unavailable'));

    const result = await setLocaleAction('ar');

    expect(setLocaleMock).toHaveBeenCalledWith('ar');
    expect(result).toEqual({ persisted: false });
  });

  it('reports persisted: false without throwing when the session cannot be resolved', async () => {
    resolveWorkspaceContextMock.mockRejectedValue(new Error('unauthenticated'));

    const result = await setLocaleAction('en');

    expect(setLocaleMock).toHaveBeenCalledWith('en');
    expect(updateWorkspaceLanguageMock).not.toHaveBeenCalled();
    expect(result).toEqual({ persisted: false });
  });
});
