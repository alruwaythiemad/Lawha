import { NextResponse } from 'next/server';
import { ApiError, withApiErrorHandling } from '../../../lib/api-error';
import { findWorkspaceById } from '../../../lib/workspace-bootstrap';
import { resolveWorkspaceContext } from '../../../lib/workspace-context';

// Story 1.6's demonstration route: the first real Route Handler in this
// repo (Dev Notes) proving AD-27 (workspace resolved from session, passed
// explicitly to a data-access function), AD-4 (a route handler, not a
// direct supabase-js read, to prove the route-handler half of the pattern
// generalizes ahead of Epic 2's writes), and NFR9 (honest error contract on
// failure) end-to-end. Read-only, no new table, no new UI page.
export const GET = withApiErrorHandling(async () => {
  const { workspaceId } = await resolveWorkspaceContext();

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new ApiError({ code: 'WORKSPACE_NOT_FOUND', messageKey: 'error.workspaceNotFound', status: 404 });
  }

  return NextResponse.json({ id: workspace.id, createdAt: workspace.createdAt.toISOString() });
});
