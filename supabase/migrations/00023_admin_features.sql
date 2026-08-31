-- Phase 5: Super Admin Control Layer

-- 1. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  enabled boolean not null default false,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- If workspace_id is null, it's a global feature flag
  UNIQUE(key, workspace_id)
);

-- RLS for feature flags (Super Admin can read/write all, normal users can only read their workspace flags and global flags)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feature flags are viewable by everyone in workspace" ON public.feature_flags
  FOR SELECT
  USING (
    workspace_id IS NULL OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    ) OR
    (public.is_super_admin(auth.uid()))
  );

CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags
  FOR ALL
  USING (public.is_super_admin(auth.uid()));


-- 2. System Health Snapshots Table
CREATE TABLE IF NOT EXISTS public.system_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric not null,
  metadata jsonb,
  recorded_at timestamptz not null default now()
);

-- RLS for system health (Super Admin only)
ALTER TABLE public.system_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view system health" ON public.system_health_snapshots
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert system health" ON public.system_health_snapshots
  FOR INSERT
  WITH CHECK (public.is_super_admin(auth.uid()));


-- 3. Error Logs Table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  error_message text not null,
  stack_trace text,
  context jsonb,
  workspace_id uuid references public.workspaces(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS for error logs (Super Admin only)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view error logs" ON public.error_logs
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));


-- 4. Update platform settings with new fields for rate limiting / maintenance
-- Add maintenance_mode if not exists (assume it doesn't)
ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS is_maintenance_mode boolean not null default false,
ADD COLUMN IF NOT EXISTS global_rate_limit_per_minute integer not null default 600;

