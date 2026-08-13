import { NextResponse } from 'next/server';
import { format, type MessageKey, type MessageValues } from '@lawha/i18n';
import { resolveLocale } from '../app/locale-cookie';

// NFR9 / Consistency Conventions "Error shape": every API error carries a
// stable machine code and a message key resolved from the ICU catalogue —
// never a bare code, stack trace, or generic failure string. `messageKey`
// is typed against packages/i18n's compile-time MessageKey so a route
// handler can't reference a catalogue key that doesn't exist.
export interface ApiErrorShape {
  code: string;
  messageKey: MessageKey;
  status: number;
  values?: MessageValues;
}

// Thrown by resolveWorkspaceContext() and route handlers; caught by
// withApiErrorHandling below and serialized to the honest { code, message }
// response shape.
export class ApiError extends Error implements ApiErrorShape {
  readonly code: string;
  readonly messageKey: MessageKey;
  readonly status: number;
  readonly values?: MessageValues;

  constructor({ code, messageKey, status, values }: ApiErrorShape) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.messageKey = messageKey;
    this.status = status;
    this.values = values;
  }
}

type RouteHandler = (request: Request) => Promise<Response>;

// Last-resort fallback if locale resolution or catalogue formatting itself
// throws — this wrapper is the one place NFR9's "never a bare code, stack
// trace, or generic failure string reaches a person" guarantee cannot itself
// fail, so it never depends on resolveLocale()/format() succeeding.
const FALLBACK_ERROR_BODY = { code: 'INTERNAL_ERROR', message: 'Something went wrong on our end. Please try again.' };

// The one sanctioned way every route handler turns a thrown ApiError (or an
// unexpected error) into a response — per this story's AC3, binding on
// every subsequent story's route handlers. Locale comes from the same
// server-resolved cookie apps/console already uses for rendering, so the
// error message lands in the caller's language, not just English.
export function withApiErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request) => {
    try {
      // Story 1.7 Dev Notes/Task 5: deliberately cookie-only here, not
      // routed through the signed-in-owner's-workspace fallback — a
      // resolveLocale() call outside a specific route's own handler would
      // need its own resolveWorkspaceContext() call, duplicating work every
      // route already does inside `handler`, purely to localize a message
      // that only appears on the error path. Staleness is bounded to at
      // most one request (the cookie is set on first resolution and on
      // every explicit change, per locale-cookie.ts), an acceptable
      // trade-off documented here rather than left as an unstated gap.
      const locale = await resolveLocale();
      try {
        return await handler(request);
      } catch (error) {
        if (error instanceof ApiError) {
          return NextResponse.json(
            { code: error.code, message: format(locale, error.messageKey, error.values) },
            { status: error.status },
          );
        }
        // Unexpected error: never leak a stack trace or the raw error message
        // to the client — a generic-but-honest 500, distinct from
        // common.errorGeneric (that key is UI-copy fallback, not this
        // contract's server-error message).
        return NextResponse.json(
          { code: 'INTERNAL_ERROR', message: format(locale, 'error.serverGeneric') },
          { status: 500 },
        );
      }
    } catch {
      // resolveLocale() or format() itself threw — fall back to a
      // hardcoded, non-localized honest error rather than let the
      // exception escape this wrapper.
      return NextResponse.json(FALLBACK_ERROR_BODY, { status: 500 });
    }
  };
}
