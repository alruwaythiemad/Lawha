import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME } from '../../locale-cookie';

/**
 * Temporary/internal only — drives the `lawha-locale` cookie from a
 * `?locale=` query param so /i18n-check can be manually exercised under
 * both lang/dir states without a real switcher (Story 1.3) or persistence
 * (Story 1.7). Deleted along with the rest of /i18n-check once this
 * story's mechanism is verified in review; a real product surface never
 * drives locale off a plain link.
 */
export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
  const response = NextResponse.redirect(new URL('/i18n-check', request.url));
  response.cookies.set(LOCALE_COOKIE_NAME, requestedLocale);
  return response;
}
