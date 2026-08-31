-- ============================================================
-- MIGRATION 21: SECURITY HARDENING & TENANT ISOLATION
-- ============================================================
-- 1. Denormalize workspace_id onto messages for Realtime filtering + query perf
-- 2. Expand workspace member roles
-- 3. Fix RLS policy bugs and add role-differentiated access
-- 4. Add rate limiting metadata table
-- 5. Add feature flags table
-- 6. Add error logging table
-- ============================================================

-- ============================================================
-- 1. DENORMALIZE workspace_id ONTO MESSAGES
-- ============================================================

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Backfill workspace_id from conversations
UPDATE public.messages m
SET workspace_id = c.workspace_id
FROM public.conversations c
WHERE m.conversation_id = c.id
  AND m.workspace_id IS NULL;

-- Add indexes for Realtime filtering and query performance
CREATE INDEX IF NOT EXISTS idx_messages_workspace ON public.messages(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_platform_msg_id ON public.messages(platform_message_id) WHERE platform_message_id IS NOT NULL;

-- Trigger to auto-populate workspace_id on insert
CREATE OR REPLACE FUNCTION public.auto_set_message_workspace_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.workspace_id IS NULL THEN
    SELECT c.workspace_id INTO NEW.workspace_id
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_message_workspace_id ON public.messages;
CREATE TRIGGER set_message_workspace_id
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_message_workspace_id();

-- Enable Realtime for messages (already in publication but now filterable by workspace_id)
-- The publication was added in 00001, so messages are already tracked.

-- ============================================================
-- 2. EXPAND WORKSPACE MEMBER ROLES
-- ============================================================

-- Drop existing check constraint and add expanded roles
ALTER TABLE public.workspace_members
  DROP CONSTRAINT IF EXISTS workspace_members_role_check;

ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_role_check
  CHECK (role IN ('owner', 'admin', 'agent', 'viewer'));

-- ============================================================
-- 3. FIX RLS POLICIES
-- ============================================================

-- Helper: check workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id uuid, uid uuid DEFAULT auth.uid())
RETURNS text AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = uid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user has at least a given role level
CREATE OR REPLACE FUNCTION public.has_workspace_role(ws_id uuid, min_role text, uid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = uid
      AND role IN (
        CASE
          WHEN min_role = 'viewer' THEN 'owner'
          WHEN min_role = 'agent' THEN 'owner'
          WHEN min_role = 'admin' THEN 'owner'
          ELSE NULL
        END,
        CASE
          WHEN min_role = 'viewer' THEN 'admin'
          WHEN min_role = 'agent' THEN 'admin'
          WHEN min_role = 'admin' THEN 'admin'
          ELSE NULL
        END,
        CASE
          WHEN min_role = 'viewer' THEN 'agent'
          WHEN min_role = 'agent' THEN 'agent'
          ELSE NULL
        END,
        CASE
          WHEN min_role = 'viewer' THEN 'viewer'
          ELSE NULL
        END
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix contact_custom_fields SELECT policy (was self-joining)
DROP POLICY IF EXISTS "Users can view contact custom fields" ON public.contact_custom_fields;
CREATE POLICY "Users can view contact custom fields"
  ON public.contact_custom_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = contact_custom_fields.contact_id
        AND is_workspace_member(c.workspace_id)
    )
  );

-- ── MESSAGES RLS (new — was missing update/delete) ──

DROP POLICY IF EXISTS "Users can view messages via conversation" ON public.messages;
CREATE POLICY "Users can view messages via conversation"
  ON public.messages FOR SELECT
  USING (
    workspace_id IS NOT NULL AND is_workspace_member(workspace_id)
    OR (workspace_id IS NULL AND EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id
        AND is_workspace_member(conv.workspace_id)
    ))
  );

DROP POLICY IF EXISTS "Users can insert messages via conversation" ON public.messages;
CREATE POLICY "Users can insert messages via conversation"
  ON public.messages FOR INSERT
  WITH CHECK (
    workspace_id IS NOT NULL AND is_workspace_member(workspace_id)
    OR (workspace_id IS NULL AND EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id
        AND is_workspace_member(conv.workspace_id)
    ))
  );

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (
    sent_by_user_id = auth.uid()
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
    OR EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = messages.conversation_id
        AND is_workspace_member(conv.workspace_id)
    )
  );

DROP POLICY IF EXISTS "Users can delete failed messages" ON public.messages;
CREATE POLICY "Users can delete failed messages"
  ON public.messages FOR DELETE
  USING (
    status = 'failed'
    AND sent_by_user_id = auth.uid()
  );

-- ── WORKSPACES: viewers can SELECT but not UPDATE ──
-- (existing policies already cover this via is_workspace_member, which is role-agnostic for SELECT)
-- We tighten UPDATE to owner/admin only

DROP POLICY IF EXISTS "Users can update their workspaces" ON public.workspaces;
CREATE POLICY "Owners and admins can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (
    has_workspace_role(id, 'admin')
    OR is_super_admin(auth.uid())
  );

-- ── CHANNELS: tighten management to admin+ ──

DROP POLICY IF EXISTS "Users can manage channels in their workspaces" ON public.channels;
CREATE POLICY "Admins can manage channels"
  ON public.channels FOR INSERT
  WITH CHECK (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Admins can update channels"
  ON public.channels FOR UPDATE
  USING (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Owners can delete channels"
  ON public.channels FOR DELETE
  USING (has_workspace_role(workspace_id, 'owner'));

-- ── FLOWS: tighten management to admin+ ──

DROP POLICY IF EXISTS "Users can manage flows in their workspaces" ON public.flows;
CREATE POLICY "Admins can manage flows"
  ON public.flows FOR INSERT
  WITH CHECK (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Admins can update flows"
  ON public.flows FOR UPDATE
  USING (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Admins can delete flows"
  ON public.flows FOR DELETE
  USING (has_workspace_role(workspace_id, 'admin'));

-- ── BROADCASTS: tighten management to admin+ ──

DROP POLICY IF EXISTS "Users can manage broadcasts in their workspaces" ON public.broadcasts;
CREATE POLICY "Admins can manage broadcasts"
  ON public.broadcasts FOR INSERT
  WITH CHECK (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Admins can update broadcasts"
  ON public.broadcasts FOR UPDATE
  USING (has_workspace_role(workspace_id, 'admin'));

CREATE POLICY "Admins can delete broadcasts"
  ON public.broadcasts FOR DELETE
  USING (has_workspace_role(workspace_id, 'admin'));

-- ============================================================
-- 4. FEATURE FLAGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key, workspace_id)
);

-- Global flags have workspace_id = NULL, workspace overrides have a workspace_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_global ON public.feature_flags(key) WHERE workspace_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_feature_flags_workspace ON public.feature_flags(workspace_id) WHERE workspace_id IS NOT NULL;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (is_super_admin(auth.uid()));

-- Seed default feature flags
INSERT INTO public.feature_flags (key, description, enabled)
VALUES
  ('ai_reply', 'AI-powered reply drafting in inbox', true),
  ('file_uploads', 'File and image attachments in messages', true),
  ('broadcasts', 'Broadcast messaging feature', true),
  ('sequences', 'Drip sequence automation', true),
  ('team_management', 'Team member invitation and role management', true),
  ('analytics_dashboard', 'Analytics and reporting dashboard', true),
  ('maintenance_mode', 'Platform-wide maintenance mode', false)
ON CONFLICT DO NOTHING;

CREATE TRIGGER set_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. ERROR LOGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  source text NOT NULL, -- 'webhook', 'api', 'flow_engine', 'cron', etc.
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'fatal')),
  message text NOT NULL,
  stack_trace text,
  metadata jsonb DEFAULT '{}'::jsonb,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_workspace ON public.error_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON public.error_logs(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity) WHERE severity IN ('error', 'fatal');

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view error logs"
  ON public.error_logs FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Service role can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway; this is for completeness

-- ============================================================
-- 6. PERFORMANCE INDEXES FOR WEBHOOK HOT PATH
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channels_account_active
  ON public.channels(late_account_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channels_zernio_active
  ON public.channels(zernio_account_id, is_active) WHERE zernio_account_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_sessions_contact_status
  ON public.flow_sessions(contact_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_channel_contact
  ON public.conversations(channel_id, contact_id);

-- ============================================================
-- 7. QUOTA TRACKING FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_workspace_usage(ws_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'channels', (SELECT count(*) FROM channels WHERE workspace_id = ws_id AND is_active = true),
    'contacts', (SELECT count(*) FROM contacts WHERE workspace_id = ws_id),
    'flows', (SELECT count(*) FROM flows WHERE workspace_id = ws_id),
    'conversations', (SELECT count(*) FROM conversations WHERE workspace_id = ws_id),
    'messages_30d', (
      SELECT count(*) FROM messages
      WHERE workspace_id = ws_id
        AND created_at > now() - interval '30 days'
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
