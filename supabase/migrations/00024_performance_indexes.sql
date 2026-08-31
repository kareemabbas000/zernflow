-- Phase 6: Performance & Scalability Indexes

-- Use CONCURRENTLY to avoid locking tables during index creation
-- Note: CONCURRENTLY cannot be used inside a transaction block, so in some environments 
-- this needs to be run outside of standard migration transactions if they are enforced.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channels_late_active 
ON public.channels(late_account_id) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channels_zernio_active 
ON public.channels(zernio_account_id) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON public.messages(conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_sessions_contact_status 
ON public.flow_sessions(contact_id, status);
