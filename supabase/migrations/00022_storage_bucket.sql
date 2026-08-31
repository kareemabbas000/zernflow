-- ============================================================
-- MIGRATION 22: STORAGE BUCKET FOR ATTACHMENTS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Note: Supabase storage objects table requires these policies for client access

CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    owner = auth.uid()
  );
