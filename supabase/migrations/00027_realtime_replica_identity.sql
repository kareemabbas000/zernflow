-- Enable FULL replica identity for tables used in client-side Realtime filtering
-- Supabase Realtime requires FULL replica identity to include non-PK columns 
-- (like workspace_id) in UPDATE and DELETE event payloads so client filters work.

ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
