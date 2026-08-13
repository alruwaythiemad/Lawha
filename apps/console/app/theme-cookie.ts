import { cookies } from 'next/headers';

export const THEME_COOKIE_NAME = 'lawha-theme';

export type Theme = 'light' | 'dark';

// Mirrors locale-cookie.ts's read/write split (Story 1.3, Task 4). Unlike
// language, this cookie is the *complete* persistence mechanism for theme —
// no FR/CAP calls for cross-device theme sync, so there is no later story
// that owns a "real" version of this the way Story 1.7 owns language.
export async function resolveTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  return cookieStore.get(THEME_COOKIE_NAME)?.value === 'dark' ? 'dark' : 'light';
}

export async function setTheme(theme: Theme): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, theme, { path: '/', maxAge: 60 * 60 * 24 * 400, sameSite: 'lax' });
}
