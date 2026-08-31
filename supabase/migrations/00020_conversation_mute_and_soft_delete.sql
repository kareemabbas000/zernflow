-- Add is_muted to conversations
ALTER TABLE conversations ADD COLUMN is_muted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete (is_active, disconnected_at) to channels is already there!
-- We just need to use it in the API.
