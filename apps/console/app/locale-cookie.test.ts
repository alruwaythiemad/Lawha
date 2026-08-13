import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieGetMock = vi.fn();
const headerGetMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: cookieGetMock, set: vi.fn() }),
  headers: () => Promise.resolve({ get: headerGetMock }),
}));

const { pickLocaleFromAcceptLanguage, resolveLocale } = await import('./locale-cookie');

describe('pickLocaleFromAcceptLanguage', () => {
  it('returns en for a missing header', () => {
    expect(pickLocaleFromAcceptLanguage(null)).toBe('en');
  });

  it('returns ar when Arabic is the highest-weighted preference', () => {
    expect(pickLocaleFromAcceptLanguage('ar,en;q=0.8')).toBe('ar');
  });

  it('returns en when English outweighs Arabic', () => {
    expect(pickLocaleFromAcceptLanguage('ar;q=0.5,en;q=0.9')).toBe('en');
  });

  it('returns en for an unrelated language', () => {
    expect(pickLocaleFromAcceptLanguage('fr-FR,fr;q=0.9')).toBe('en');
  });
});

describe('resolveLocale', () => {
  beforeEach(() => {
    cookieGetMock.mockReset();
    headerGetMock.mockReset();
  });

  it('prefers the caller-supplied workspace language over the cookie (AC1: a signed-in owner outranks a stale pre-auth cookie)', async () => {
    cookieGetMock.mockReturnValue({ value: 'en' });
    await expect(resolveLocale('ar')).resolves.toBe('ar');
    expect(cookieGetMock).not.toHaveBeenCalled();
  });

  it('falls back to the cookie when no workspace language is supplied (unauthenticated request)', async () => {
    cookieGetMock.mockReturnValue({ value: 'ar' });
    await expect(resolveLocale()).resolves.toBe('ar');
  });

  it('falls back to Accept-Language when neither workspace language nor cookie is available (AC2)', async () => {
    cookieGetMock.mockReturnValue(undefined);
    headerGetMock.mockReturnValue('ar,en;q=0.8');
    await expect(resolveLocale()).resolves.toBe('ar');
  });

  it('ignores a malformed cookie value and falls through the resolution order', async () => {
    cookieGetMock.mockReturnValue({ value: 'fr' });
    headerGetMock.mockReturnValue('en');
    await expect(resolveLocale()).resolves.toBe('en');
  });
});
