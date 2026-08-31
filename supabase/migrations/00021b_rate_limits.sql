-- ============================================================
-- MIGRATION 21b: RATE LIMITS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  limit_count int NOT NULL DEFAULT 100,
  window_seconds int NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_workspace ON public.rate_limits(workspace_id);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can read their workspace rate limits"
  ON public.rate_limits FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE TRIGGER set_rate_limits_updated_at BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add rate_limit_state table to actually track limits (token bucket)
CREATE TABLE IF NOT EXISTS public.rate_limit_state (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE, -- e.g. "ws_id:endpoint" or "ip:endpoint"
  tokens float NOT NULL,
  last_refill_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_state_key ON public.rate_limit_state(key);

-- Service role bypasses RLS for tracking state. We can enable RLS and give it no policies
ALTER TABLE public.rate_limit_state ENABLE ROW LEVEL SECURITY;

-- RPC for token bucket rate limiting
CREATE OR REPLACE FUNCTION public.consume_rate_limit_token(
  limit_key text,
  max_tokens float,
  refill_rate float -- tokens per second
)
RETURNS boolean AS $$
DECLARE
  current_state public.rate_limit_state%ROWTYPE;
  now_ts timestamptz := now();
  time_passed float;
  new_tokens float;
BEGIN
  -- Try to get existing state
  SELECT * INTO current_state FROM public.rate_limit_state WHERE key = limit_key FOR UPDATE;

  IF NOT FOUND THEN
    -- First time, bucket is full minus the one token we are consuming
    INSERT INTO public.rate_limit_state (key, tokens, last_refill_at)
    VALUES (limit_key, max_tokens - 1, now_ts);
    RETURN true;
  END IF;

  -- Refill tokens based on time passed
  time_passed := EXTRACT(EPOCH FROM (now_ts - current_state.last_refill_at));
  new_tokens := LEAST(max_tokens, current_state.tokens + (time_passed * refill_rate));

  IF new_tokens >= 1 THEN
    -- Consume 1 token
    UPDATE public.rate_limit_state
    SET tokens = new_tokens - 1, last_refill_at = now_ts
    WHERE key = limit_key;
    RETURN true;
  ELSE
    -- Rate limited
    -- We can still update last_refill_at and tokens so we don't lose fractional tokens
    UPDATE public.rate_limit_state
    SET tokens = new_tokens, last_refill_at = now_ts
    WHERE key = limit_key;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
