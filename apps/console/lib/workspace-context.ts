import { auth } from '@clerk/nextjs/server';
import { ApiError } from './api-error';
import { ensureWorkspaceForClerkUser } from './workspace-bootstrap';

export interface WorkspaceContext {
  workspaceId: string;
  clerkUserId: string;
}

// AD-27's concrete enforcement point: this is the *only* sanctioned way any
// route handler obtains a workspaceId to pass into the data-access layer.
// The workspace is always resolved from the authenticated Clerk session —
// never from req.json(), a path segment, or a query string. A route
// handler that reads workspaceId any other way is a defect, per AD-27.
//
// A Route Handler sits outside the (console) layout's auth.protect() call
// (that gate only runs for pages rendered under that layout), so this
// function performs its own auth check rather than assuming one already
// ran — mirroring the layout's own "resolve session → resolve workspace"
// sequence (apps/console/app/(console)/layout.tsx) for the route-handler
// path.
export async function resolveWorkspaceContext(): Promise<WorkspaceContext> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError({ code: 'UNAUTHENTICATED', messageKey: 'error.unauthenticated', status: 401 });
  }

  const workspace = await ensureWorkspaceForClerkUser(userId);
  return { workspaceId: workspace.id, clerkUserId: userId };
}
