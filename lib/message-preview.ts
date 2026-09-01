const PREVIEW_LENGTH = 100;

/**
 * Generates a clean preview string for `conversations.last_message_preview`.
 * 
 * Supports text truncation as well as native preview placeholders for all media types
 * (e.g. photos, videos, voice notes, story mentions, shared posts, reels, stickers, documents).
 */
export function messagePreview(
  text: string | null | undefined,
  attachments?: any[] | null,
  options?: { isStoryMention?: boolean; isStoryReply?: boolean }
): string {
  if (text && typeof text === "string" && text.trim().length > 0) {
    return Array.from(text.trim()).slice(0, PREVIEW_LENGTH).join("");
  }

  if (options?.isStoryMention) {
    return "📸 Story mention";
  }

  if (options?.isStoryReply) {
    return "💬 Story reply";
  }

  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    const first = attachments[0];
    const type = ((first?.type || "") as string).toLowerCase();

    if (type.includes("story_mention") || first?.isStoryMention) {
      return "📸 Story mention";
    }
    if (type.includes("story") || type.includes("reply")) {
      return "💬 Story reply";
    }
    if (type.includes("reel") || type.includes("ig_reel")) {
      return "🎬 Shared reel";
    }
    if (type.includes("share") || type.includes("post")) {
      return "🔗 Shared post";
    }
    if (type.includes("image") || type.includes("photo") || type.includes("picture")) {
      return "📷 Photo";
    }
    if (type.includes("video")) {
      return "🎥 Video";
    }
    if (type.includes("audio") || type.includes("voice")) {
      return "🎤 Voice note";
    }
    if (type.includes("sticker") || type.includes("animated_image")) {
      return "✨ Sticker";
    }
    if (type.includes("loc")) {
      return "📍 Location";
    }
    if (type.includes("doc") || type.includes("file") || type.includes("pdf")) {
      return `📄 ${first.name || "Document"}`;
    }

    return "📎 Attachment";
  }

  return "";
}
