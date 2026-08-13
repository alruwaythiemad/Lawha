import { NextResponse } from 'next/server';
import type { Locale } from '@lawha/domain';
import { ApiError, withApiErrorHandling } from '../../../../lib/api-error';
import { updateWorkspaceLanguage } from '../../../../lib/workspace-bootstrap';
import { resolveWorkspaceContext } from '../../../../lib/workspace-context';

// Story 1.7 Task 4: the write route backing the persisted-language-preference
// feature (AC1). Mirrors apps/console/app/api/workspace/route.ts's exact
// composition (withApiErrorHandling + resolveWorkspaceContext), extended
// with a validated PATCH body — the same AD-27/NFR9 pattern applied to the
// first write path in this repo's route handlers.
export const PATCH = withApiErrorHandling(async (request) => {
  const { workspaceId } = await resolveWorkspaceContext();

  const body: unknown = await request.json().catch(() => null);
  const language = (body as { language?: unknown } | null)?.language;
  if (language !== 'en' && language !== 'ar') {
    throw new ApiError({ code: 'VALIDATION_FAILED', messageKey: 'error.invalidLanguage', status: 400 });
  }

  const workspace = await updateWorkspaceLanguage(workspaceId, language satisfies Locale);

  return NextResponse.json({ id: workspace.id, language: workspace.language });
});
