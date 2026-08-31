-- Create a new public bucket for temporary media storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp_media', 'temp_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload to temp_media
CREATE POLICY "Allow authenticated uploads to temp_media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'temp_media');

-- Allow public read access to temp_media
CREATE POLICY "Allow public read access to temp_media" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'temp_media');

-- Allow authenticated users to delete their temp_media
CREATE POLICY "Allow authenticated deletions from temp_media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'temp_media');
