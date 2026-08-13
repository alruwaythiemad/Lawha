-- Story 1.7: owner language preference persistence.
--
-- Workspace-level column, not a new user/owner table: AD-15 makes
-- workspace_id the only tenancy key (never user_id), and FR-57 establishes
-- one account = one workspace in v1, so the workspace row already *is* the
-- per-owner setting for this release. Mirrors packages/i18n's Locale union
-- ('en' | 'ar') via a check constraint kept in application-shape sync with
-- that type, not a Postgres enum (matches this table's existing plain-text
-- column style).
--
-- No new RLS policy: this table only has SELECT policies (workspace_branch
-- migration) — all writes are already service-role-mediated (AD-4/AD-27),
-- and this column follows that same pattern. The existing
-- workspace_set_updated_at trigger already fires on any column update, this
-- one included.

alter table workspace
  add column language text not null default 'en'
  constraint workspace_language_check check (language in ('en', 'ar'));

-- create_workspace_with_default_branch's return shape must include the new
-- column so packages/adapters' createWorkspaceWithDefaultBranch can return
-- a complete Workspace (now that Workspace.language is required) without
-- hardcoding the 'en' default a second time in application code. Postgres
-- requires drop+recreate (not create or replace) when a `returns table`
-- shape changes column count.
drop function create_workspace_with_default_branch(text, uuid, uuid, text);

create function create_workspace_with_default_branch(
  p_clerk_user_id text,
  p_workspace_id uuid,
  p_branch_id uuid,
  p_branch_name text
)
returns table (
  workspace_id uuid,
  workspace_language text,
  workspace_created_at timestamptz,
  workspace_updated_at timestamptz,
  branch_id uuid,
  branch_workspace_id uuid,
  branch_name text,
  branch_address text,
  branch_created_at timestamptz,
  branch_updated_at timestamptz
)
language plpgsql
set search_path = ''
as $$
declare
  v_workspace_id uuid;
begin
  insert into public.workspace (id) values (p_workspace_id);

  insert into public.workspace_member (workspace_id, clerk_user_id)
  values (p_workspace_id, p_clerk_user_id)
  on conflict (clerk_user_id) do update set clerk_user_id = excluded.clerk_user_id
  returning workspace_member.workspace_id into v_workspace_id;

  if v_workspace_id = p_workspace_id then
    insert into public.branch (id, workspace_id, name) values (p_branch_id, p_workspace_id, p_branch_name);
  else
    delete from public.workspace where id = p_workspace_id;
  end if;

  return query
  select w.id, w.language, w.created_at, w.updated_at, b.id, b.workspace_id, b.name, b.address, b.created_at, b.updated_at
  from public.workspace w
  join public.branch b on b.workspace_id = w.id
  where w.id = v_workspace_id
  order by b.created_at asc
  limit 1;
end;
$$;
