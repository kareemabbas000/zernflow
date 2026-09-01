"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Image as ImageIcon,
  Loader2,
  Film,
  ExternalLink,
  Check,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  Heart,
  MessageCircle,
  Globe,
} from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  text: string;
  mediaUrl: string | null;
  mediaType?: string;
  platform: string;
  permalink?: string | null;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
}

interface PostSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (postId: string) => void;
  selectedPostIds?: string[];
  channelId?: string | null;
  channelName?: string;
}

export function PostSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedPostIds = [],
  channelId,
  channelName,
}: PostSelectorModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [platformTab, setPlatformTab] = useState<"all" | "instagram" | "facebook">("all");

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/v1/posts", window.location.origin);
      if (channelId) {
        url.searchParams.set("channelId", channelId);
      } else {
        url.searchParams.set("channelId", "all");
      }
      if (platformTab !== "all") {
        url.searchParams.set("platform", platformTab);
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch posts from Meta");
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, channelId, platformTab]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (platformTab !== "all" && p.platform !== platformTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.text.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [posts, search, platformTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Select Published Posts & Reels</span>
              {channelName && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({channelName})
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose which Instagram / Facebook posts or reels will trigger comment automations
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar: Platform Tabs, Search, View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border bg-muted/10 p-3.5">
          {/* Platform filter tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl shrink-0">
            {(["all", "instagram", "facebook"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPlatformTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all",
                  platformTab === tab
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab !== "all" && <PlatformIcon platform={tab} size={13} />}
                <span>{tab === "all" ? "All Platforms" : tab}</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by caption or post ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Refresh & View Mode */}
          <div className="flex items-center gap-1 shrink-0 justify-end">
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh posts from platform"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-primary")} />
            </button>
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded-md text-xs transition-colors",
                  viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1 rounded-md text-xs transition-colors",
                  viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
                title="Table List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[55vh]">
          {loading ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">Fetching posts from Meta...</p>
              <p className="text-xs text-muted-foreground">Loading published posts & reels</p>
            </div>
          ) : error ? (
            <div className="flex h-52 flex-col items-center justify-center text-center p-4">
              <p className="text-sm text-rose-500 font-semibold">{error}</p>
              <button
                onClick={fetchPosts}
                className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Retry
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center text-center p-4">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No posts found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {search
                  ? "Try a different search keyword"
                  : "No published posts found on this account yet."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            // ── Grid Cards View ─────────────────────────────────────────────
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredPosts.map((post) => {
                const isSelected = selectedPostIds.includes(post.id);
                const isVideo = post.mediaType === "video" || post.mediaUrl?.includes(".mp4");

                return (
                  <div
                    key={post.id}
                    onClick={() => onSelect(post.id)}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 shadow-md bg-primary/5"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                    )}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-square w-full bg-black/20 overflow-hidden">
                      {post.mediaUrl ? (
                        <img
                          src={post.mediaUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/40">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Video / Reel badge */}
                      {isVideo && (
                        <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                          <Film className="h-3 w-3" />
                          <span>Reel</span>
                        </div>
                      )}

                      {/* Platform badge */}
                      <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 shadow-sm backdrop-blur-xs text-white">
                        <PlatformIcon platform={post.platform} size={12} />
                      </div>

                      {/* Selection Checkmark */}
                      <div
                        className={cn(
                          "absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md scale-100"
                            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Caption & Metadata */}
                    <div className="p-2.5 flex flex-col justify-between flex-1 gap-2 bg-card">
                      <p className="line-clamp-2 text-xs leading-relaxed text-foreground font-normal">
                        {post.text || <span className="text-muted-foreground italic">No caption</span>}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <span className="font-mono truncate max-w-[90px]">
                          ID: {post.id.slice(0, 10)}...
                        </span>
                        {post.permalink && (
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span>View</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // ── Table List View ─────────────────────────────────────────────
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {filteredPosts.map((post) => {
                const isSelected = selectedPostIds.includes(post.id);
                const isVideo = post.mediaType === "video" || post.mediaUrl?.includes(".mp4");

                return (
                  <div
                    key={post.id}
                    onClick={() => onSelect(post.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 transition-colors cursor-pointer select-none",
                      isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                    )}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input bg-card"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-black/20 border border-border">
                      {post.mediaUrl ? (
                        <img
                          src={post.mediaUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                          <Film className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Caption & details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {post.text || "No caption text"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="capitalize">{post.platform}</span>
                        <span>•</span>
                        <span className="font-mono">ID: {post.id}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action link */}
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {selectedPostIds.length === 0
              ? "No specific post selected (Will apply to all posts)"
              : `${selectedPostIds.length} post${selectedPostIds.length > 1 ? "s" : ""} selected`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
