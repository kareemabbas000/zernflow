import { createClient } from "@/lib/supabase/client";

export const ATTACHMENTS_BUCKET = "temp_media";

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
  
  // Get standard public URL since Zernio/Meta APIs require a clean public URL to fetch media
  const { data: publicUrlData } = supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .getPublicUrl(data.path);
    
  return {
    path: data.path,
    url: publicUrlData.publicUrl,
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
