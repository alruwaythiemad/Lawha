import { describe, expect, it, vi } from 'vitest';

const VALID_ENV = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_abc',
  CLERK_SECRET_KEY: 'sk_test_abc',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
};

async function loadEnvWith(overrides: Record<string, string | undefined>) {
  vi.resetModules();
  const previous = { ...process.env };
  const merged = { ...VALID_ENV, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    return await import('./env');
  } finally {
    process.env = previous;
  }
}

describe('env schema', () => {
  it('loads successfully when all five vars are present and well-formed', async () => {
    const { env } = await loadEnvWith({});
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID_ENV.NEXT_PUBLIC_SUPABASE_URL);
  });

  it('refuses to load when a required var is missing', async () => {
    await expect(loadEnvWith({ CLERK_SECRET_KEY: undefined })).rejects.toThrow(/CLERK_SECRET_KEY/);
  });

  it('refuses to load when NEXT_PUBLIC_SUPABASE_URL is malformed', async () => {
    await expect(loadEnvWith({ NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' })).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});
