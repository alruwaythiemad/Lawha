import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { generateId, type Workspace, type WorkspaceBootstrapResult, type WorkspaceRepository } from '@lawha/domain';

// AD-27: service-role credentials are confined to this adapter layer —
// never construct a service-role client anywhere else. Callers pass the
// URL/key in explicitly (from apps/console/lib/env.ts) rather than this
// module reading process.env itself, so packages/adapters stays free of
// any framework-specific env-loading assumption.
export function createSupabaseWorkspaceRepository(
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
): WorkspaceRepository {
  const client = createClient(supabaseUrl, supabaseServiceRoleKey);
  return new SupabaseWorkspaceRepository(client);
}

class SupabaseWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findWorkspaceForClerkUser(clerkUserId: string): Promise<Workspace | null> {
    // Single indexed lookup (unique constraint on clerk_user_id) — AC2
    // requires repeat sign-in to resolve to the *existing* workspace via a
    // real lookup, not a stateful heuristic. Two queries rather than an
    // embedded-resource select: without generated Database types,
    // supabase-js can't infer the workspace_id FK as a to-one relation, so
    // an embedded select types as an array regardless of actual cardinality.
    const membership = await this.client
      .from('workspace_member')
      .select('workspace_id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (membership.error) throw new Error(`findWorkspaceForClerkUser failed: ${membership.error.message}`);
    if (!membership.data) return null;

    const workspace = await this.client
      .from('workspace')
      .select('id, created_at, updated_at')
      .eq('id', membership.data.workspace_id)
      .single();

    if (workspace.error) throw new Error(`findWorkspaceForClerkUser failed: ${workspace.error.message}`);

    return toWorkspace(workspace.data as WorkspaceRow);
  }

  async createWorkspaceWithDefaultBranch(clerkUserId: string): Promise<WorkspaceBootstrapResult> {
    // One Postgres function call = one transaction: insert workspace_member,
    // workspace, and branch all succeed or all fail together (Task 5),
    // mirroring AD-17's lock-and-insert pattern for "new user's first
    // workspace" instead of entitlement. Idempotent under concurrent
    // first-sign-in requests via the workspace_member.clerk_user_id unique
    // constraint (Task 4's migration), not an application-level
    // check-then-insert race.
    const { data, error } = await this.client
      .rpc('create_workspace_with_default_branch', {
        p_clerk_user_id: clerkUserId,
        p_workspace_id: generateId(),
        p_branch_id: generateId(),
        p_branch_name: 'Main',
      })
      .single();

    if (error) throw new Error(`createWorkspaceWithDefaultBranch failed: ${error.message}`);

    const row = data as CreateWorkspaceRpcRow;
    return {
      workspace: {
        id: row.workspace_id,
        createdAt: new Date(row.workspace_created_at),
        updatedAt: new Date(row.workspace_updated_at),
      },
      branch: {
        id: row.branch_id,
        workspaceId: row.branch_workspace_id,
        name: row.branch_name,
        address: row.branch_address,
        createdAt: new Date(row.branch_created_at),
        updatedAt: new Date(row.branch_updated_at),
      },
    };
  }
}

interface WorkspaceRow {
  id: string;
  created_at: string;
  updated_at: string;
}

interface CreateWorkspaceRpcRow {
  workspace_id: string;
  workspace_created_at: string;
  workspace_updated_at: string;
  branch_id: string;
  branch_workspace_id: string;
  branch_name: string;
  branch_address: string | null;
  branch_created_at: string;
  branch_updated_at: string;
}

function toWorkspace(row: WorkspaceRow): Workspace {
  return { id: row.id, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
}
