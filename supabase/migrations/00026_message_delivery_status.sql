-- Add delivery_status column to messages table
ALTER TABLE messages
ADD COLUMN delivery_status text CHECK (delivery_status IN ('sent', 'delivered', 'read')) DEFAULT 'sent';

-- Update existing outbound messages to 'sent'
UPDATE messages
SET delivery_status = 'sent'
WHERE direction = 'outbound' AND delivery_status IS NULL;
