"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Search,
  Phone,
  MessageSquare,
  BarChart3,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { PLATFORM_DETAILS, PLATFORM_LABELS, type Platform } from "@/lib/platforms";

interface SelectionItem {
  id: string;
  name: string;
  username?: string | null;
  category?: string | null;
  profilePicture?: string;
  wabaId?: string;
  wabaName?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State machine
  const [viewState, setViewState] = useState<
    "loading" | "selecting_facebook_page" | "selecting_instagram_account" | "selecting_whatsapp_number" | "twitter_success" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState("Securing authorization session...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selection state
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Connected account preview (for X / Twitter or direct sync)
  const [connectedAccountInfo, setConnectedAccountInfo] = useState<{
    displayName?: string;
    username?: string;
    profilePicture?: string;
    platform?: string;
  } | null>(null);

  // Query params
  const stateParam = searchParams.get("state") || "";
  const tempTokenParam = searchParams.get("tempToken") || searchParams.get("temp_token") || "";
  const userProfileParam = searchParams.get("userProfile") || searchParams.get("user_profile") || "";
  const connectedParam = searchParams.get("connected") || "";
  const platformParam = searchParams.get("platform") || "";
  const stepParam = searchParams.get("step") || "";
  const errorParam = searchParams.get("error") || searchParams.get("error_description") || "";

  useEffect(() => {
    async function processOAuthCallback() {
      // 1. Handle OAuth Provider Error
      if (errorParam) {
        setViewState("error");
        setErrorMessage(
          errorParam === "access_denied"
            ? "Authorization was cancelled. No social account was connected."
            : `Authorization failed: ${errorParam}`
        );
        return;
      }

      // 0. Extract effective platform from state or query
      let effectivePlatform = platformParam.toLowerCase();
      if (!effectivePlatform && stateParam) {
        try {
          const raw = stateParam.split(".")[0];
          const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
          const jsonStr = atob(normalized);
          const parsedState = JSON.parse(jsonStr);
          if (parsedState.platform) {
            effectivePlatform = String(parsedState.platform).toLowerCase();
          }
        } catch (e) {
          // ignore decode errors
        }
      }

      const normalizedStep = (stepParam || "").toLowerCase().replace(/[-_]/g, "");

      // 2. WhatsApp Multi-Number Selection Flow
      if (
        tempTokenParam &&
        (effectivePlatform === "whatsapp" ||
          normalizedStep === "selectphonenumber" ||
          normalizedStep === "selectnumber")
      ) {
        setViewState("loading");
        setMessage("Fetching your WhatsApp Business numbers...");

        try {
          const res = await fetch("/api/v1/channels/whatsapp/list-numbers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              state: stateParam,
              tempToken: tempTokenParam,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            setViewState("error");
            setErrorMessage(data.error || "Failed to retrieve WhatsApp numbers.");
            return;
          }

          const rawNumbers = data.phoneNumbers || [];
          const formatted: SelectionItem[] = rawNumbers.map((n: any) => ({
            id: n.id,
            name: n.verifiedName || n.displayPhoneNumber,
            username: n.displayPhoneNumber,
            category: n.wabaName || "WhatsApp Business",
            displayPhoneNumber: n.displayPhoneNumber,
            verifiedName: n.verifiedName,
            wabaId: n.wabaId,
            qualityRating: n.qualityRating,
          }));

          setItems(formatted);
          if (formatted.length > 0) {
            setSelectedId(formatted[0].id);
            setViewState("selecting_whatsapp_number");
          } else {
            setViewState("error");
            setErrorMessage("No verified WhatsApp Business numbers found in your Meta account.");
          }
        } catch (err) {
          console.error("WhatsApp list numbers error:", err);
          setViewState("error");
          setErrorMessage("Failed to communicate with authorization server.");
        }
        return;
      }

      // 3. Instagram Account Selection Flow
      if (
        tempTokenParam &&
        (effectivePlatform === "instagram" ||
          normalizedStep === "selectaccount" ||
          normalizedStep === "selectpageandinstagram" ||
          normalizedStep === "selectinstagram")
      ) {
        setViewState("loading");
        setMessage("Fetching your connected Instagram Business accounts...");

        try {
          const res = await fetch("/api/v1/channels/headless/list-pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              state: stateParam,
              tempToken: tempTokenParam,
              userProfile: userProfileParam,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            setViewState("error");
            setErrorMessage(data.error || "Failed to retrieve Instagram accounts.");
            return;
          }

          const pages: SelectionItem[] = data.pages || [];
          setItems(pages);
          if (pages.length > 0) {
            setSelectedId(pages[0].id);
            setViewState("selecting_instagram_account");
          } else {
            setViewState("error");
            setErrorMessage("No Instagram Business accounts found. Ensure your Instagram account is linked to a Facebook Page.");
          }
        } catch (err) {
          console.error("Instagram list accounts error:", err);
          setViewState("error");
          setErrorMessage("Failed to retrieve Instagram accounts.");
        }
        return;
      }

      // 4. Facebook Page Selection Flow
      if (tempTokenParam) {
        setViewState("loading");
        setMessage("Fetching your available Facebook Pages...");

        try {
          const res = await fetch("/api/v1/channels/headless/list-pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              state: stateParam,
              tempToken: tempTokenParam,
              userProfile: userProfileParam,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            setViewState("error");
            setErrorMessage(data.error || "Failed to retrieve Facebook pages.");
            return;
          }

          const pages: SelectionItem[] = data.pages || [];
          setItems(pages);
          if (pages.length > 0) {
            setSelectedId(pages[0].id);
            setViewState("selecting_facebook_page");
          } else {
            setViewState("error");
            setErrorMessage("No managed Facebook Pages found. Ensure you have administrator access to at least one Facebook Page.");
          }
        } catch (err) {
          console.error("Facebook list pages error:", err);
          setViewState("error");
          setErrorMessage("Failed to retrieve Facebook pages.");
        }
        return;
      }

      // 5. Direct Connection Flow (Single account platforms like X / Twitter, direct WhatsApp, etc.)
      try {
        setViewState("loading");
        setMessage("Finalizing channel connection...");

        const res = await fetch("/api/v1/channels/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stateParam }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setViewState("error");
          setErrorMessage(data.error || "Failed to finalize channel synchronization.");
          return;
        }

        const platform = connectedParam || platformParam || "channel";

        // If X / Twitter: Show special capability confirmation card
        if (platform === "twitter") {
          const firstAccount = data.accounts?.[0];
          setConnectedAccountInfo({
            displayName: firstAccount?.displayName || "X Account",
            username: firstAccount?.username ? `@${firstAccount.username.replace(/^@/, "")}` : undefined,
            profilePicture: firstAccount?.profilePicture,
            platform: "twitter",
          });
          setViewState("twitter_success");
          return;
        }

        setViewState("success");
        setMessage(`${PLATFORM_LABELS[platform as Platform] || "Channel"} connected successfully!`);

        setTimeout(() => {
          router.push(`/dashboard/channels?connected=${encodeURIComponent(platform)}`);
        }, 400);
      } catch (err) {
        console.error("Direct sync error:", err);
        setViewState("error");
        setErrorMessage("Connection completed. Redirecting to channel dashboard...");
        setTimeout(() => router.push("/dashboard/channels"), 600);
      }
    }

    processOAuthCallback();
  }, [searchParams, stateParam, tempTokenParam, userProfileParam, connectedParam, platformParam, stepParam, errorParam, router]);

  // Handle Facebook Page Selection Submit
  async function handleConfirmFacebookPage() {
    if (!selectedId) return;
    const selectedItem = items.find((p) => p.id === selectedId);
    setIsSubmitting(true);
    setMessage(`Connecting "${selectedItem?.name || "Facebook Page"}" to your workspace...`);

    try {
      const res = await fetch("/api/v1/channels/headless/select-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: stateParam,
          pageId: selectedId,
          pageName: selectedItem?.name || "Facebook Page",
          username: selectedItem?.username || null,
          profilePicture: selectedItem?.profilePicture || null,
          tempToken: tempTokenParam,
          userProfile: userProfileParam,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setIsSubmitting(false);
        setErrorMessage(data.error || "Failed to finalize Facebook page connection.");
        return;
      }

      setViewState("success");
      setMessage(`"${selectedItem?.name || "Facebook Page"}" connected successfully!`);
      setTimeout(() => router.push("/dashboard/channels?connected=facebook"), 400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage("Connection failed. Please try again.");
    }
  }

  // Handle Instagram Account Selection Submit
  async function handleConfirmInstagramAccount() {
    if (!selectedId) return;
    const selectedItem = items.find((p) => p.id === selectedId);
    setIsSubmitting(true);
    setMessage(`Connecting @${selectedItem?.username || selectedItem?.name || "account"} to your workspace...`);

    try {
      const res = await fetch("/api/v1/channels/headless/select-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: stateParam,
          pageId: selectedId,
          pageName: selectedItem?.name || "Instagram Account",
          username: selectedItem?.username || null,
          profilePicture: selectedItem?.profilePicture || null,
          tempToken: tempTokenParam,
          userProfile: userProfileParam,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setIsSubmitting(false);
        setErrorMessage(data.error || "Failed to finalize Instagram account connection.");
        return;
      }

      setViewState("success");
      setMessage(`Instagram account connected successfully!`);
      setTimeout(() => router.push("/dashboard/channels?connected=instagram"), 400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage("Connection failed. Please try again.");
    }
  }

  // Handle WhatsApp Phone Number Selection Submit
  async function handleConfirmWhatsAppNumber() {
    if (!selectedId) return;
    const selectedItem = items.find((n) => n.id === selectedId);
    setIsSubmitting(true);
    setMessage(`Connecting WhatsApp number ${selectedItem?.displayPhoneNumber || ""}...`);

    try {
      const res = await fetch("/api/v1/channels/whatsapp/select-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: stateParam,
          phoneNumberId: selectedId,
          wabaId: selectedItem?.wabaId,
          displayPhoneNumber: selectedItem?.displayPhoneNumber,
          verifiedName: selectedItem?.verifiedName,
          tempToken: tempTokenParam,
          userProfile: userProfileParam,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setIsSubmitting(false);
        setErrorMessage(data.error || "Failed to finalize WhatsApp number connection.");
        return;
      }

      setViewState("success");
      setMessage(`WhatsApp Business number connected successfully!`);
      setTimeout(() => router.push("/dashboard/channels?connected=whatsapp"), 400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage("Connection failed. Please try again.");
    }
  }

  // Filter items by search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.username?.toLowerCase().includes(q) ||
      item.displayPhoneNumber?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q)
    );
  });

  // --- Render Views ---

  // 1. Facebook Page Selection View
  if (viewState === "selecting_facebook_page") {
    return (
      <div className="w-full max-w-xl mx-auto py-8 px-4">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Select Facebook Page</h2>
              <p className="text-sm text-muted-foreground">
                Choose the Facebook Page you want to connect to this workspace.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Live Search Bar for Facebook Pages */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Facebook pages by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredItems.length} of {items.length} {items.length === 1 ? "page" : "pages"}</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline text-xs"
              >
                Reset search
              </button>
            )}
          </div>

          <div className="mt-3 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Search className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-sm font-medium">No Facebook pages match "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-primary hover:underline font-semibold"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              filteredItems.map((page) => {
                const isSelected = selectedId === page.id;
                return (
                  <div
                    key={page.id}
                    onClick={() => !isSubmitting && setSelectedId(page.id)}
                    className={`group relative flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      {page.profilePicture ? (
                        <img src={page.profilePicture} alt={page.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground">{page.name.charAt(0)}</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate text-foreground">{page.name}</h4>
                        {page.category && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{page.category}</span>}
                      </div>
                      {page.username && <p className="text-xs text-muted-foreground truncate mt-0.5">@{page.username}</p>}
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">ID: {page.id}</p>
                    </div>

                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Link href="/dashboard/channels" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </Link>
            <button
              onClick={handleConfirmFacebookPage}
              disabled={!selectedId || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting Page...
                </>
              ) : (
                <>
                  Connect Selected Page
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Instagram Account Selection View
  if (viewState === "selecting_instagram_account") {
    return (
      <div className="w-full max-w-xl mx-auto py-8 px-4">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-md">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Select Instagram Account</h2>
              <p className="text-sm text-muted-foreground">
                Choose the Instagram account you want to connect to this workspace.
              </p>
            </div>
          </div>

          {/* Live Search Bar for Instagram Accounts */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Instagram accounts by handle, name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredItems.length} of {items.length} {items.length === 1 ? "account" : "accounts"}</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline text-xs"
              >
                Reset search
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-3 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Search className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-sm font-medium">No Instagram accounts match "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-primary hover:underline font-semibold"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              filteredItems.map((account) => {
                const isSelected = selectedId === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => !isSubmitting && setSelectedId(account.id)}
                    className={`group relative flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-pink-500 bg-pink-500/5 ring-2 ring-pink-500/20 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      {account.profilePicture ? (
                        <img src={account.profilePicture} alt={account.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground">{account.name.charAt(0)}</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate text-foreground">{account.name}</h4>
                      <p className="text-xs text-pink-600 dark:text-pink-400 font-medium truncate mt-0.5">
                        @{account.username || account.name.toLowerCase().replace(/\s+/g, "")}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">ID: {account.id}</p>
                    </div>

                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-pink-600 bg-pink-600 text-white" : "border-muted-foreground/40"}`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Link href="/dashboard/channels" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </Link>
            <button
              onClick={handleConfirmInstagramAccount}
              disabled={!selectedId || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-pink-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting Account...
                </>
              ) : (
                <>
                  Connect Selected Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. WhatsApp Business Phone Number Selection View
  if (viewState === "selecting_whatsapp_number") {
    return (
      <div className="w-full max-w-xl mx-auto py-8 px-4">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 0C5.394 0 0 5.394 0 12.031c0 2.122.553 4.188 1.602 6.008L0 24l6.166-1.583a12.007 12.007 0 0 0 5.865 1.514h.005c6.634 0 12.029-5.394 12.029-12.031 0-3.216-1.252-6.241-3.528-8.516C18.272 1.252 15.247 0 12.031 0zm0 22.023h-.004a10.01 10.01 0 0 1-5.105-1.396l-.366-.217-3.791.973.994-3.693-.238-.382a9.99 9.99 0 0 1-1.534-5.277c0-5.526 4.496-10.022 10.026-10.022 2.678 0 5.197 1.043 7.091 2.937 1.895 1.895 2.938 4.414 2.938 7.092 0 5.527-4.496 10.023-10.026 10.023z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Select WhatsApp Business Number</h2>
              <p className="text-sm text-muted-foreground">
                Choose the phone number customers will message in this workspace.
              </p>
            </div>
          </div>

          {/* Live Search Bar for WhatsApp Numbers */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by phone number, name, or WABA ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredItems.length} of {items.length} {items.length === 1 ? "number" : "numbers"}</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline text-xs"
              >
                Reset search
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-3 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Search className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-sm font-medium">No WhatsApp numbers match "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-primary hover:underline font-semibold"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              filteredItems.map((num) => {
                const isSelected = selectedId === num.id;
                return (
                  <div
                    key={num.id}
                    onClick={() => !isSubmitting && setSelectedId(num.id)}
                    className={`group relative flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                      <Phone className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate text-foreground">{num.name || "WhatsApp Business"}</h4>
                        {num.qualityRating && (
                          <span className="shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-semibold">
                            {num.qualityRating} QUALITY
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {num.displayPhoneNumber}
                      </p>
                      {num.category && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{num.category}</p>}
                    </div>

                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/40"}`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Link href="/dashboard/channels" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </Link>
            <button
              onClick={handleConfirmWhatsAppNumber}
              disabled={!selectedId || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting Number...
                </>
              ) : (
                <>
                  Connect WhatsApp Number
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. X / Twitter Success Confirmation Card
  if (viewState === "twitter_success") {
    return (
      <div className="w-full max-w-lg mx-auto py-8 px-4">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-bold tracking-tight">X Account Connected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your X profile is linked and ready for messaging, publishing, and analytics.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white font-bold text-sm">
                {connectedAccountInfo?.displayName?.charAt(0) || "X"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{connectedAccountInfo?.displayName || "Connected X Profile"}</h4>
                <p className="text-xs text-muted-foreground truncate">{connectedAccountInfo?.username || "@account"}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Granted Capabilities</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-foreground/90">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Direct Messages</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Post Publishing</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Media & Attachments</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Account Analytics</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/inbox"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
            >
              <MessageSquare className="h-4 w-4" />
              Open Inbox
            </Link>
            <Link
              href="/dashboard/channels"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-border py-2.5 px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Return to Channels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. General Loading State
  if (viewState === "loading") {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h3 className="text-base font-semibold">{message}</h3>
          <p className="text-xs text-muted-foreground">
            Please wait while we verify your social authorization.
          </p>
        </div>
      </div>
    );
  }

  // 6. General Success State
  if (viewState === "success") {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">{message}</h3>
          <p className="text-xs text-muted-foreground">Redirecting to your channel manager...</p>
        </div>
      </div>
    );
  }

  // 7. Error State
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold">Connection Incomplete</h3>
        <p className="text-sm text-muted-foreground">
          {errorMessage || "An error occurred while connecting your social account."}
        </p>
        <Link
          href="/dashboard/channels"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Return to Channels
        </Link>
      </div>
    </div>
  );
}

export default function ChannelCallbackPage() {
  return (
    <div className="flex h-full min-h-[80vh] items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading authorization...</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
