"use client";

import { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  FileText,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Instagram,
  Facebook,
  Share2,
  Maximize2,
  X,
  Radio,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/types/database";

export interface AttachmentItem {
  type?: string;
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  title?: string;
  payload?: {
    url?: string;
    id?: string;
    title?: string;
    caption?: string;
    reel_video_id?: string;
    thumbnail_url?: string;
    coordinates?: { lat: number; long: number };
    [key: string]: any;
  };
  isStoryMention?: boolean;
  isStoryReply?: boolean;
  storyUrl?: string;
  referral?: any;
  [key: string]: any;
}

/**
 * Custom voice note / audio player with playback bar
 */
function VoiceNotePlayer({ url, isInbound }: { url: string; isInbound: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl p-2.5 min-w-[220px] sm:min-w-[260px] border shadow-xs transition-colors",
        isInbound
          ? "bg-background/90 border-border/70 text-foreground"
          : "bg-primary-foreground/15 border-primary-foreground/20 text-primary-foreground"
      )}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer",
          isInbound
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        )}
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </button>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="relative h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              isInbound ? "bg-primary" : "bg-primary-foreground"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Radio className="h-3 w-3 animate-pulse text-rose-500" />
            <span>{formatTime(duration)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Story Media Preview — handles photo stories, video stories (MP4 streams), and expired fallbacks
 */
function StoryMediaPreview({
  url,
  onExpand,
}: {
  url: string;
  onExpand: (url: string) => void;
}) {
  const [mediaType, setMediaType] = useState<"image" | "video" | "expired">("image");

  if (mediaType === "expired") {
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 text-center">
        <Instagram className="h-5 w-5 text-rose-500 mb-1 opacity-70" />
        <span className="text-[11px] font-semibold text-foreground/80">Story Media Expired</span>
        <span className="text-[9px] text-muted-foreground">Stories expire after 24 hours</span>
      </div>
    );
  }

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-xl bg-black/40 group min-h-[140px] flex items-center justify-center"
      onClick={() => onExpand(url)}
    >
      {mediaType === "image" ? (
        <img
          src={url}
          alt="Story preview"
          referrerPolicy="no-referrer"
          className="h-auto w-full object-cover max-h-[260px] rounded-xl transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={() => {
            // Instagram Story is often a video/mp4 stream
            setMediaType("video");
          }}
        />
      ) : (
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="h-auto w-full object-cover max-h-[260px] rounded-xl transition-transform duration-200 group-hover:scale-105"
          onError={() => {
            setMediaType("expired");
          }}
        />
      )}

      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
      </div>
    </div>
  );
}

/**
 * Native Attachment Renderer supporting all Meta, WhatsApp, Telegram, Facebook, X, and Zernio message types
 */
export function AttachmentRenderer({
  attachments,
  platform,
  isInbound,
  isStoryMention,
  isStoryReply,
}: {
  attachments: AttachmentItem[] | null | undefined;
  platform?: Platform | null;
  isInbound: boolean;
  isStoryMention?: boolean;
  isStoryReply?: boolean;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-2 flex flex-col gap-2">
        {attachments.filter(Boolean).map((att, index) => {
          const rawUrl = att.url || att.payload?.url;
          const url = rawUrl || att.storyUrl || "";
          const type = ((att.type || "") as string).toLowerCase();

          // ── 0. Ad Referral / Click-to-Message Ad ────────────────────────
          if (type === "ad_referral" || type === "referral") {
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-3 max-w-[290px] shadow-xs"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">
                    Replied to Instagram Ad
                  </span>
                </div>

                {url && (
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-xl bg-black/30 mb-2 group"
                    onClick={() => setLightboxUrl(url)}
                  >
                    <img
                      src={url}
                      alt="Ad creative preview"
                      referrerPolicy="no-referrer"
                      className="h-auto w-full object-cover max-h-[200px] rounded-xl transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                {att.payload?.headline && (
                  <p className="text-xs font-bold text-foreground line-clamp-1">
                    {att.payload.headline}
                  </p>
                )}
                {att.payload?.body && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {att.payload.body}
                  </p>
                )}

                {att.payload?.sourceUrl && (
                  <a
                    href={att.payload.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>View original ad</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          }

          // ── 1. Story Mention & Story Reply ─────────────────────────────
          const isMention = isStoryMention || att.isStoryMention || type.includes("story_mention");
          const isReply = isStoryReply || att.isStoryReply || type.includes("story_reply") || type === "story";

          if (isMention || isReply) {
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-amber-500/10 p-2.5 max-w-[280px] shadow-sm backdrop-blur-xs"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                    <Instagram className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-bold tracking-tight text-foreground">
                    {isMention ? "Story Mention" : "Story Reply"}
                  </span>
                </div>

                {url && <StoryMediaPreview url={url} onExpand={(u) => setLightboxUrl(u)} />}

                <p className="mt-2 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <span>{isMention ? "Mentioned you in their story" : "Replied to this story"}</span>
                </p>
              </div>
            );
          }

          // ── 2. Audio / Voice Note ──────────────────────────────────────
          const isAudio =
            type === "audio" ||
            type === "voice" ||
            type === "voice_note" ||
            type === "audio_note" ||
            url.includes(".ogg") ||
            url.includes(".m4a") ||
            url.includes(".aac") ||
            url.includes(".mp3") ||
            url.includes(".wav") ||
            (url.includes("ig_messaging_cdn") && !url.includes("video_id") && !isMention && !isReply);

          if (isAudio && url) {
            return <VoiceNotePlayer key={index} url={url} isInbound={isInbound} />;
          }

          // ── 3. Shared Instagram Reel / Post / External Link Card ───────
          const isReelOrPostLink =
            url.includes("instagram.com/reel/") ||
            url.includes("instagram.com/p/") ||
            url.includes("instagr.am") ||
            Boolean(att.payload?.reel_video_id) ||
            type === "share" ||
            type === "post" ||
            type === "reel" ||
            type === "ig_reel" ||
            type === "story_share" ||
            type.includes("share");

          if (isReelOrPostLink) {
            const isReel = url.includes("/reel/") || type.includes("reel") || Boolean(att.payload?.reel_video_id);
            const title = att.payload?.title || att.payload?.caption || att.title || "";
            const directPostUrl = att.payload?.url || url;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card max-w-[285px] shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/40">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-2xs">
                      {isReel ? <Film className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                    </div>
                    <span className="text-[11px] font-bold text-foreground">
                      {isReel ? "Shared Instagram Reel" : "Shared Instagram Post"}
                    </span>
                  </div>
                  {directPostUrl && (
                    <a
                      href={directPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                      title="Open on Instagram"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Caption / Title */}
                {title && (
                  <div className="p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-36 overflow-y-auto font-normal bg-card">
                    {title}
                  </div>
                )}

                {/* Action CTA */}
                {directPostUrl && (
                  <div className="p-2 border-t border-border/40 bg-muted/20">
                    <a
                      href={directPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 text-foreground text-[11px] font-semibold transition-all border border-rose-500/20"
                    >
                      <Instagram className="h-3.5 w-3.5 text-rose-500" />
                      <span>{isReel ? "Watch Reel on Instagram" : "View Post on Instagram"}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-0.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          }

          // ── 4. Direct Video Stream ────────────────────────────────────
          const isDirectVideo =
            (type === "video" || url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov")) &&
            url.startsWith("http");

          if (isDirectVideo && url) {
            return (
              <div
                key={index}
                className="max-w-[300px] overflow-hidden rounded-2xl border border-border/50 bg-black shadow-sm"
              >
                <video
                  src={url}
                  controls
                  className="h-auto w-full max-h-[320px] rounded-2xl"
                  preload="metadata"
                />
              </div>
            );
          }

          // ── 5. Image / Photo ───────────────────────────────────────────
          const isImage =
            type === "image" ||
            type === "photo" ||
            type === "picture" ||
            url.endsWith(".jpg") ||
            url.endsWith(".jpeg") ||
            url.endsWith(".png") ||
            url.endsWith(".webp");

          if (isImage && url) {
            return (
              <div
                key={index}
                className="relative max-w-[300px] overflow-hidden rounded-2xl border border-border/50 bg-muted/30 group cursor-pointer"
                onClick={() => setLightboxUrl(url)}
              >
                <img
                  src={url}
                  alt={att.name || "Photo"}
                  referrerPolicy="no-referrer"
                  className="h-auto w-full object-cover max-h-[320px] rounded-2xl transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>Expand</span>
                </div>
              </div>
            );
          }

          // ── 6. Sticker / GIF ───────────────────────────────────────────
          if (type === "sticker" || type === "animated_image_share" || type === "gif") {
            return (
              <div key={index} className="max-w-[160px] p-1">
                <img
                  src={url}
                  alt="Sticker"
                  referrerPolicy="no-referrer"
                  className="h-auto w-full object-contain max-h-[160px] drop-shadow-md"
                  loading="lazy"
                />
              </div>
            );
          }

          // ── 7. Location ────────────────────────────────────────────────
          if (type === "location" || att.payload?.coordinates) {
            const coords = att.payload?.coordinates;
            const mapUrl = coords
              ? `https://maps.google.com/?q=${coords.lat},${coords.long}`
              : url;

            return (
              <a
                key={index}
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 max-w-[260px] hover:bg-muted/50 transition-colors shadow-xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">Location Shared</p>
                  <p className="text-[10px] text-muted-foreground">Click to view on Google Maps</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </a>
            );
          }

          // ── 8. Document / File ─────────────────────────────────────────
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download={att.name || "attachment"}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 max-w-[280px] hover:bg-muted/50 transition-colors shadow-xs group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">
                  {att.name || "Document Attachment"}
                </p>
                {att.size && (
                  <p className="text-[10px] text-muted-foreground">
                    {(att.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </a>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Expanded view"
            referrerPolicy="no-referrer"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
