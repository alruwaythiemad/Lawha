import type { ReactNode } from 'react';
import { bidiIsolationSpec, type BidiMode } from '@lawha/i18n';

/**
 * Thin React wrapper around packages/i18n's framework-agnostic
 * bidiIsolationSpec — isolates a mixed Arabic/Latin run as markup (<bdi>
 * or dir="ltr"), never Unicode control characters (FR50).
 */
export function BidiIsolate({ children, mode = 'auto' }: { children: ReactNode; mode?: BidiMode }) {
  const spec = bidiIsolationSpec(mode);
  const Tag = spec.tag;
  return <Tag dir={spec.dir}>{children}</Tag>;
}
