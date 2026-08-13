import { format, formatDate, formatNumber } from '@lawha/i18n';
import { resolveLocale } from '../locale-cookie';
import { BidiIsolate } from './bidi-isolate';

/**
 * Temporary/internal route proving packages/i18n's mechanism end to end
 * (AC1–AC8) — same pattern as Story 1.1's /token-check, not a real
 * product surface. Console Shell (Story 1.3) owns real UI.
 *
 * The EN/AR links below drive the `lawha-locale` cookie through
 * /i18n-check/set-locale (also temporary) — a manual test aid, not the
 * Story 1.3 language switcher.
 */
export default async function I18nCheckPage() {
  const locale = await resolveLocale();

  const demoDate = new Date(Date.UTC(2026, 7, 12));
  const demoNumber = 12345.6;
  const demoPhone = '+966 50 123 4567';

  // Review finding: no product-wide mechanism yet exists to select an `-ar`
  // typography tier without a component branching on locale (AD-21 forbids
  // that pattern for real UI). This route is temporary/deletable scaffolding,
  // not a real component, so it picks the tier locally rather than block on
  // that unresolved design question — Story 1.3 (Console Shell) owns the
  // real mechanism for permanent components.
  const bodyClass = locale === 'ar' ? 'type-body-ar' : 'type-body';

  return (
    <main className="ps-page-margin pe-page-margin pt-page-margin pb-page-margin">
      <nav>
        <a href="/i18n-check/set-locale?locale=en">{format(locale, 'i18nCheck.langEn')}</a>{' '}
        <a href="/i18n-check/set-locale?locale=ar">{format(locale, 'i18nCheck.langAr')}</a>
      </nav>

      {/* AC2: a plain catalogue string */}
      <p className={bodyClass}>{format(locale, 'common.appName')}</p>

      {/* AC2: a catalogue string with a named placeholder */}
      <p className={bodyClass}>{format(locale, 'common.greeting', { name: 'Nadia' })}</p>

      {/* AC7: a mixed Arabic/Latin run (app name + phone number) wrapped in bidi isolation */}
      <p className={bodyClass}>
        {format(locale, 'common.appName')} — <BidiIsolate>{demoPhone}</BidiIsolate>
      </p>

      {/* AC8: locale-formatted date and number, Latin-digit numerals, LTR inside isolation */}
      <p className={bodyClass}>
        <BidiIsolate mode="ltr">{formatDate(locale, demoDate, { year: 'numeric', month: 'long', day: 'numeric' })}</BidiIsolate>
      </p>
      <p className={bodyClass}>
        <BidiIsolate mode="ltr">{formatNumber(locale, demoNumber)}</BidiIsolate>
      </p>

      {/* AC5: reflow container — min-block-size (not block-size), no fixed width/height.
          Raw arbitrary value: no spacing token models a temporary demo reflow
          container's min-height, and this page is deletable scaffolding, not
          a token-consuming product surface — see review findings. */}
      <div className="mt-gutter [min-block-size:6rem]">
        <p className={bodyClass}>{format(locale, 'common.errorGeneric')}</p>
      </div>
    </main>
  );
}
