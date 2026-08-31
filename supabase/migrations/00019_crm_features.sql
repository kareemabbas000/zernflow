-- ============================================================
-- MIGRATION 19: CRM KANBAN & INTERNAL NOTES
-- ============================================================

-- 1. Contacts: Lead Stage for Kanban View
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS lead_stage text NOT NULL DEFAULT 'lead' 
  CHECK (lead_stage IN ('lead', 'negotiation', 'won', 'lost'));

CREATE INDEX IF NOT EXISTS idx_contacts_lead_stage ON public.contacts(workspace_id, lead_stage);

-- 2. Messages: Internal Notes
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_internal boolean NOT NULL DEFAULT false;
