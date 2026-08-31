import { createClient } from "@/lib/supabase/client";

export const ATTACHMENTS_BUCKET = "attachments";

/**
 * Uploads a file to Supabase Storage and returns its path and public/signed URL.
 */
export async function uploadAttachment(
  workspaceId: string,
  conversationId: string,
  file: File
) {
  const supabase = createClient();
  
  // Create a unique path: workspaceId/conversationId/timestamp_filename
  const timestamp = Date.now();
  // Sanitize filename to avoid weird characters
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${workspaceId}/${conversationId}/${timestamp}_${safeName}`;
  
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Since the bucket is private (for Zernio to access we might need a signed URL, 
  // or if we want it public for now, we could use getPublicUrl).
  // For maximum compatibility and security, let's create a signed URL valid for a long time (e.g. 1 year)
  // or rely on a backend route to proxy if strictly private. 
  // For this implementation, we will generate a signed URL valid for 30 days.
  const { data: signedData, error: signError } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(data.path, 60 * 60 * 24 * 30); // 30 days
    
  if (signError) {
    throw new Error(`Failed to generate signed URL: ${signError.message}`);
  }
  
  return {
    path: data.path,
    url: signedData.signedUrl,
  };
}

/**
 * Deletes an attachment from storage.
 */
export async function deleteAttachment(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([path]);
    
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
  
  return true;
}
