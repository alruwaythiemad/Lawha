export type Locale = 'en' | 'ar';

export const LOCALES: readonly Locale[] = ['en', 'ar'];

export type Direction = 'ltr' | 'rtl';

export function directionForLocale(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
