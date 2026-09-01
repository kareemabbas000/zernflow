import { useState, useEffect, useMemo } from "react";
import { X, Search, Image as ImageIcon, Loader2 } from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";

interface Post {
  id: string;
  text: string;
  mediaUrl: string | null;
  platform: string;
  createdAt: string;
}

interface PostSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (postId: string) => void;
  channelId?: string | null;
}

export function PostSelectorModal({ isOpen, onClose, onSelect, channelId }: PostSelectorModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;

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

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isOpen, channelId]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    return posts.filter((p) => p.text.toLowerCase().includes(search.toLowerCase()));
  }, [posts, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Select a Post</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts by caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Fetching posts from Zernio...</p>
            </div>
          ) : error ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-sm text-rose-500 font-medium">{error}</p>
              <button onClick={onClose} className="mt-4 text-sm text-muted-foreground hover:underline">
                Close
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-foreground font-medium">No posts found</p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try a different search term" : "You haven't published any posts yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    onSelect(post.id);
                    onClose();
                  }}
                  className="group relative flex aspect-square flex-col overflow-hidden rounded-lg border border-border bg-muted/20 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  {/* Thumbnail / Placeholder */}
                  <div className="flex-1 bg-muted relative w-full overflow-hidden">
                    {post.mediaUrl ? (
                      <img src={post.mediaUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur">
                      <PlatformIcon platform={post.platform} size={14} />
                    </div>
                  </div>
                  {/* Caption */}
                  <div className="h-14 border-t border-border bg-card p-2">
                    <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {post.text || "No caption"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
