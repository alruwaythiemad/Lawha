-- Story 1.5: workspace/branch schema, first real migration in this repo.
--
-- Data model judgment call (Dev Notes): membership is a join table
-- (workspace_member), not a single owner_clerk_user_id column on
-- workspace. This lets multi-workspace-per-account (post-v1) arrive as new
-- rows later instead of a schema migration, per FR-57. A unique constraint
-- on clerk_user_id enforces v1's one-workspace-per-account rule and also
-- doubles as the concurrency guard for Task 5's create-workspace op (AD-17
-- style: uniqueness constraint, not check-then-insert).
--
-- UUIDv7 primary keys are supplied by the application (packages/domain's
-- generateId(), Task 3) — Postgres 17 has no native uuidv7(), so no column
-- DEFAULT is set here.

create table workspace (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_member (
  workspace_id uuid not null references workspace (id) on delete cascade,
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, clerk_user_id),
  -- v1: exactly one workspace per Clerk account (PRD FR-57).
  unique (clerk_user_id)
);

create table branch (
  id uuid primary key,
  workspace_id uuid not null references workspace (id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index branch_workspace_id_idx on branch (workspace_id);

-- Shared updated_at maintenance — SECURITY INVOKER (default) is fine here,
-- it only touches the row already being written by the caller.
create function set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspace_set_updated_at
  before update on workspace
  for each row
  execute function set_updated_at();

create trigger branch_set_updated_at
  before update on branch
  for each row
  execute function set_updated_at();

-- RLS (AD-15: workspace_id is the only tenancy key, never user_id/branch_id
-- — here membership resolution keys on clerk_user_id, which is how a
-- workspace_id is discovered in the first place, not a substitute
-- tenancy key on branch itself). RLS is defence in depth (AD-4): the
-- actual workspace creation/lookup on sign-in goes through a server route
-- backed by the service-role adapter (Task 5/6), not a direct client write
-- — so only SELECT policies are needed; no policy for INSERT/UPDATE/DELETE
-- means those are denied by default for anon/authenticated.

alter table workspace enable row level security;
alter table workspace_member enable row level security;
alter table branch enable row level security;

-- Clerk's native third-party JWT carries the Clerk user ID in the standard
-- `sub` claim and "role": "authenticated" once the integration (Task 1) is
-- enabled.
create policy "workspace_member_select_own" on workspace_member
  for select
  to authenticated
  using (clerk_user_id = (select auth.jwt() ->> 'sub'));

create policy "workspace_select_member" on workspace
  for select
  to authenticated
  using (
    exists (
      select 1
      from workspace_member
      where workspace_member.workspace_id = workspace.id
        and workspace_member.clerk_user_id = (select auth.jwt() ->> 'sub')
    )
  );

create policy "branch_select_member" on branch
  for select
  to authenticated
  using (
    exists (
      select 1
      from workspace_member
      where workspace_member.workspace_id = branch.workspace_id
        and workspace_member.clerk_user_id = (select auth.jwt() ->> 'sub')
    )
  );

-- Task 5: the atomic "new user's first workspace" write. IDs are supplied
-- by the caller (packages/domain's generateId(), never gen_random_uuid()).
-- SECURITY INVOKER (the default — no "security definer" here, per the
-- Supabase security checklist: never reach for definer to sidestep RLS).
-- The service-role caller already bypasses RLS via BYPASSRLS, so this
-- function's writes succeed for it; if anything other than the service
-- role ever calls this rpc, RLS blocks the inserts (no INSERT policy
-- exists on any of these tables) and the call errors — RLS as defence in
-- depth (AD-4) for this write path too.
--
-- Concurrency: the "on conflict (clerk_user_id) do update ... returning"
-- upsert always returns a row, whichever caller's insert actually won the
-- race — so two concurrent first-sign-in requests for the same Clerk user
-- (two tabs, a retry) both resolve to the one workspace that was actually
-- created, without a check-then-insert race window.
create function create_workspace_with_default_branch(
  p_clerk_user_id text,
  p_workspace_id uuid,
  p_branch_id uuid,
  p_branch_name text
)
returns table (
  workspace_id uuid,
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
  -- workspace_member.workspace_id has a FK to workspace(id), so the
  -- candidate workspace row must exist before we can even attempt the
  -- membership insert. Create it speculatively; if we lose the race below,
  -- it gets deleted before the transaction commits, so no orphan row is
  -- ever visible to another transaction.
  insert into public.workspace (id) values (p_workspace_id);

  insert into public.workspace_member (workspace_id, clerk_user_id)
  values (p_workspace_id, p_clerk_user_id)
  on conflict (clerk_user_id) do update set clerk_user_id = excluded.clerk_user_id
  returning workspace_member.workspace_id into v_workspace_id;

  if v_workspace_id = p_workspace_id then
    -- We won: this is a genuinely new workspace, give it its default branch.
    insert into public.branch (id, workspace_id, name) values (p_branch_id, p_workspace_id, p_branch_name);
  else
    -- Lost the race: another concurrent call already holds this Clerk
    -- user's membership. Discard the speculative workspace row above.
    delete from public.workspace where id = p_workspace_id;
  end if;

  return query
  select w.id, w.created_at, w.updated_at, b.id, b.workspace_id, b.name, b.address, b.created_at, b.updated_at
  from public.workspace w
  join public.branch b on b.workspace_id = w.id
  where w.id = v_workspace_id
  order by b.created_at asc
  limit 1;
end;
$$;
