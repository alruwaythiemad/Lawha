import { describe, expect, it, vi } from 'vitest';

vi.mock('../app/locale-cookie', () => ({
  resolveLocale: vi.fn().mockResolvedValue('en'),
}));

const { ApiError, withApiErrorHandling } = await import('./api-error');

describe('withApiErrorHandling', () => {
  it('maps a thrown ApiError to its code/status and a resolved catalogue message', async () => {
    const handler = withApiErrorHandling(async () => {
      throw new ApiError({ code: 'WORKSPACE_NOT_FOUND', messageKey: 'error.workspaceNotFound', status: 404 });
    });

    const response = await handler(new Request('http://localhost/api/workspace'));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ code: 'WORKSPACE_NOT_FOUND', message: "We couldn't find your workspace. Try signing in again." });
  });

  it('maps an unexpected error to a safe, generic 500 without leaking the raw message', async () => {
    const handler = withApiErrorHandling(async () => {
      throw new Error('raw internal detail that must never reach a client');
    });

    const response = await handler(new Request('http://localhost/api/workspace'));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(body.message).not.toContain('raw internal detail');
  });

  it('passes a successful response through unchanged', async () => {
    const handler = withApiErrorHandling(async () => Response.json({ ok: true }));

    const response = await handler(new Request('http://localhost/api/workspace'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
