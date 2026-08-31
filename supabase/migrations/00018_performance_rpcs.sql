-- ============================================================
-- MIGRATION 18: PERFORMANCE RPCS FOR INBOX & CRM
-- ============================================================

-- 1. Unread counts RPC
CREATE OR REPLACE FUNCTION get_workspace_unread_counts(ws_id uuid)
RETURNS jsonb AS $$
DECLARE
  total_unread int;
  platform_counts jsonb;
BEGIN
  -- Total unread conversations
  SELECT COALESCE(SUM(unread_count), 0) INTO total_unread
  FROM conversations
  WHERE workspace_id = ws_id AND unread_count > 0;

  -- Breakdown by platform
  SELECT jsonb_object_agg(platform, p_count) INTO platform_counts
  FROM (
    SELECT platform, SUM(unread_count) as p_count
    FROM conversations
    WHERE workspace_id = ws_id AND unread_count > 0
    GROUP BY platform
  ) sub;

  RETURN jsonb_build_object(
    'all', total_unread,
    'by_platform', COALESCE(platform_counts, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. CRM Contacts Search RPC
CREATE OR REPLACE FUNCTION search_workspace_contacts(
  ws_id uuid,
  search_query text DEFAULT NULL,
  tag_name text DEFAULT NULL,
  req_is_subscribed boolean DEFAULT NULL,
  max_limit int DEFAULT 50,
  row_offset int DEFAULT 0
) RETURNS TABLE (contact_id uuid, total_count bigint) AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT c.id, c.last_interaction_at
    FROM contacts c
    WHERE c.workspace_id = ws_id
    AND (search_query IS NULL OR c.display_name ILIKE '%' || search_query || '%' OR c.email ILIKE '%' || search_query || '%')
    AND (req_is_subscribed IS NULL OR c.is_subscribed = req_is_subscribed)
    AND (
      tag_name IS NULL OR EXISTS (
        SELECT 1 FROM contact_tags ct
        JOIN tags t ON t.id = ct.tag_id
        WHERE ct.contact_id = c.id AND t.name = tag_name
      )
    )
  ),
  counted AS (
    SELECT count(*) as total FROM filtered
  )
  SELECT f.id, c.total
  FROM filtered f
  CROSS JOIN counted c
  ORDER BY f.last_interaction_at DESC NULLS LAST
  LIMIT max_limit
  OFFSET row_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
