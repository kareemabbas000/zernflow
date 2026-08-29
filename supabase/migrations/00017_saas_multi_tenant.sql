-- ============================================================
-- MIGRATION 17: SAAS MULTI-TENANT & SUPER ADMIN ARCHITECTURE
-- ============================================================

-- Enable UUID extension if not present
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES & PLATFORM ROLES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  platform_role text not null default 'user' check (platform_role in ('user', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_platform_role on public.profiles(platform_role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_email on public.profiles(email);

-- Helper function to check if current or specified user is a super admin
create or replace function public.is_super_admin(uid uuid default auth.uid())
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = uid and platform_role = 'super_admin' and status = 'active'
  );
$$ language sql security definer stable;

-- Sync profile from auth.users
create or replace function public.handle_user_profile_sync()
returns trigger as $$
declare
  user_full_name text;
begin
  user_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, email, avatar_url, platform_role, status)
  values (
    new.id,
    user_full_name,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'platform_role', 'user'),
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_user_profile_sync();

-- Backfill profiles for existing users if any
insert into public.profiles (id, full_name, email, platform_role, status)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  'user',
  'active'
from auth.users u
on conflict (id) do nothing;

-- ============================================================
-- 2. WORKSPACE ENHANCEMENTS (MULTI-TENANCY & STATUS)
-- ============================================================

alter table public.workspaces
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists zernio_profile_id text,
  add column if not exists subscription_status text not null default 'active'
    check (subscription_status in ('trialing', 'active', 'suspended', 'cancelled', 'past_due')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended')),
  add column if not exists plan text not null default 'free',
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists limits jsonb default '{"max_channels": 10, "max_contacts": 5000, "max_flows": 25}'::jsonb;

create index if not exists idx_workspaces_owner on public.workspaces(owner_id);
create index if not exists idx_workspaces_zernio_profile on public.workspaces(zernio_profile_id);
create index if not exists idx_workspaces_status on public.workspaces(status);
create index if not exists idx_workspaces_subscription_status on public.workspaces(subscription_status);

-- Backfill owner_id from workspace_members
update public.workspaces w
set owner_id = wm.user_id
from public.workspace_members wm
where wm.workspace_id = w.id and wm.role = 'owner' and w.owner_id is null;

-- ============================================================
-- 3. CHANNEL ENHANCEMENTS
-- ============================================================

alter table public.channels
  add column if not exists zernio_account_id text,
  add column if not exists status text not null default 'connected'
    check (status in ('connected', 'disconnected', 'error')),
  add column if not exists connected_at timestamptz not null default now(),
  add column if not exists disconnected_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;

-- Backfill zernio_account_id from late_account_id if present
update public.channels
set zernio_account_id = late_account_id
where zernio_account_id is null and late_account_id is not null;

create index if not exists idx_channels_zernio_account_id on public.channels(zernio_account_id);
create index if not exists idx_channels_status on public.channels(status);

-- ============================================================
-- 4. AUDIT LOGS
-- ============================================================

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_user_id uuid references auth.users(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor on public.audit_logs(actor_user_id);
create index if not exists idx_audit_logs_workspace on public.audit_logs(workspace_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);

-- ============================================================
-- 5. PLATFORM SETTINGS
-- ============================================================

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Seed default platform settings
insert into public.platform_settings (key, value)
values
  ('branding', '{"app_name": "Platform", "tagline": "Multi-Channel Social Automation & Messaging Platform", "support_email": "support@example.com"}'::jsonb),
  ('features', '{"allow_signup": true, "enforce_email_verification": false, "default_trial_days": 14}'::jsonb)
on conflict (key) do nothing;

-- ============================================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================================

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- 7. REVISED HANDLE_NEW_USER TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  ws_id uuid;
  user_name text;
  workspace_slug text;
begin
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Create profile first
  insert into public.profiles (id, full_name, email, avatar_url, platform_role, status)
  values (
    new.id,
    user_name,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'platform_role', 'user'),
    'active'
  )
  on conflict (id) do nothing;

  -- Create initial workspace if requested or default
  workspace_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(new.id::text, 1, 8);

  insert into public.workspaces (name, slug, owner_id, status, subscription_status)
  values (user_name || '''s Workspace', workspace_slug, new.id, 'active', 'active')
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner')
  on conflict do nothing;

  return new;
exception when others then
  raise log 'handle_new_user error: % %', sqlerrm, sqlstate;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all new tables
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;

-- PROFILES RLS
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid() or is_super_admin(auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid() or is_super_admin(auth.uid()))
  with check (
    -- Normal users cannot promote themselves to super_admin
    case
      when is_super_admin(auth.uid()) then true
      else (id = auth.uid() and platform_role = (select platform_role from public.profiles where id = auth.uid()))
    end
  );

drop policy if exists "Super admins can manage all profiles" on public.profiles;
create policy "Super admins can manage all profiles"
  on public.profiles for all
  using (is_super_admin(auth.uid()));

-- AUDIT LOGS RLS
drop policy if exists "Members can view workspace audit logs" on public.audit_logs;
create policy "Members can view workspace audit logs"
  on public.audit_logs for select
  using (
    (workspace_id is not null and is_workspace_member(workspace_id))
    or is_super_admin(auth.uid())
  );

drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;
create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert
  with check (auth.uid() is not null);

-- PLATFORM SETTINGS RLS
drop policy if exists "Users can read platform settings" on public.platform_settings;
create policy "Users can read platform settings"
  on public.platform_settings for select
  using (auth.uid() is not null);

drop policy if exists "Super admins can update platform settings" on public.platform_settings;
create policy "Super admins can update platform settings"
  on public.platform_settings for all
  using (is_super_admin(auth.uid()));

-- WORKSPACES RLS (Add Super Admin Access)
drop policy if exists "Super admins can view all workspaces" on public.workspaces;
create policy "Super admins can view all workspaces"
  on public.workspaces for select
  using (is_super_admin(auth.uid()));

drop policy if exists "Super admins can update all workspaces" on public.workspaces;
create policy "Super admins can update all workspaces"
  on public.workspaces for update
  using (is_super_admin(auth.uid()));

-- CHANNELS RLS (Add Super Admin Access)
drop policy if exists "Super admins can view all channels" on public.channels;
create policy "Super admins can view all channels"
  on public.channels for select
  using (is_super_admin(auth.uid()));
