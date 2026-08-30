/**
 * Platform definitions, capabilities, and connection metadata.
 * KA COMM drives multi-channel messaging, automations, and AI agents.
 */

export const PLATFORMS = [
  "facebook",
  "instagram",
  "whatsapp",
  "twitter",
  "telegram",
  "bluesky",
  "reddit",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export type PlatformCapability =
  | "inbox"
  | "messaging"
  | "comments"
  | "publishing"
  | "stories"
  | "templates"
  | "broadcasts"
  | "automation"
  | "analytics"
  | "bot_messages"
  | "dms";

export interface PlatformMetadata {
  id: Platform;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  connectionType: "oauth_headless" | "oauth_direct" | "waba_wizard" | "bot_wizard";
  capabilities: PlatformCapability[];
  badgeColor: string;
  accentColor: string;
  isPopular?: boolean;
}

export const PLATFORM_DETAILS: Record<Platform, PlatformMetadata> = {
  facebook: {
    id: "facebook",
    name: "Facebook",
    shortName: "Facebook",
    tagline: "Connect your Facebook Pages",
    description: "Manage Page DMs, post comments, and automate Facebook Messenger flows.",
    connectionType: "oauth_headless",
    capabilities: ["inbox", "messaging", "comments", "publishing", "analytics", "automation"],
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    accentColor: "#1877F2",
    isPopular: true,
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    shortName: "Instagram",
    tagline: "Connect your Instagram Business or Creator account",
    description: "Automate Instagram DMs, story replies, post comments, and inbound lead funnels.",
    connectionType: "oauth_headless",
    capabilities: ["inbox", "messaging", "comments", "publishing", "stories", "analytics", "automation"],
    badgeColor: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
    accentColor: "#E4405F",
    isPopular: true,
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business",
    shortName: "WhatsApp",
    tagline: "Connect your WhatsApp Business number",
    description: "Engage customers with WhatsApp Cloud API, verified templates, broadcasts, and AI chatbots.",
    connectionType: "waba_wizard",
    capabilities: ["inbox", "messaging", "templates", "broadcasts", "automation", "analytics"],
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
    accentColor: "#25D366",
    isPopular: true,
  },
  twitter: {
    id: "twitter",
    name: "X / Twitter",
    shortName: "X",
    tagline: "Connect your X (Twitter) account",
    description: "Handle X Direct Messages, sync posts, monitor mentions, and automate responses.",
    connectionType: "oauth_direct",
    capabilities: ["inbox", "dms", "publishing", "analytics", "automation"],
    badgeColor: "bg-neutral-800/10 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700",
    accentColor: "#000000",
    isPopular: true,
  },
  telegram: {
    id: "telegram",
    name: "Telegram",
    shortName: "Telegram",
    tagline: "Connect your Telegram channel or group",
    description: "Broadcast announcements, manage customer support chats, and trigger workflow automations.",
    connectionType: "bot_wizard",
    capabilities: ["inbox", "publishing", "bot_messages", "automation"],
    badgeColor: "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800",
    accentColor: "#229ED9",
    isPopular: true,
  },
  bluesky: {
    id: "bluesky",
    name: "Bluesky",
    shortName: "Bluesky",
    tagline: "Connect your Bluesky handle",
    description: "Post updates and engage with followers on the AT Protocol decentralized network.",
    connectionType: "oauth_direct",
    capabilities: ["publishing", "inbox"],
    badgeColor: "bg-blue-400/10 text-blue-500 border-blue-200 dark:border-blue-800",
    accentColor: "#0285FF",
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    shortName: "Reddit",
    tagline: "Connect your Reddit account",
    description: "Engage with communities, track discussions, and manage subreddit communications.",
    connectionType: "oauth_direct",
    capabilities: ["publishing", "inbox"],
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
    accentColor: "#FF4500",
  },
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  twitter: "X / Twitter",
  telegram: "Telegram",
  bluesky: "Bluesky",
  reddit: "Reddit",
};

export function isSupportedPlatform(value: unknown): value is Platform {
  return (
    typeof value === "string" && (PLATFORMS as readonly string[]).includes(value)
  );
}

export function normalizePlatform(raw: unknown): Platform | null {
  if (!raw || typeof raw !== "string") return null;
  const p = raw.toLowerCase().trim().replace(/[-_]/g, "");

  if (p === "facebook" || p === "facebookpage" || p === "fb" || p === "meta") return "facebook";
  if (p === "instagram" || p === "instagrambusiness" || p === "ig") return "instagram";
  if (p === "whatsapp" || p === "whatsappbusiness" || p === "wa" || p === "waba") return "whatsapp";
  if (p === "twitter" || p === "x" || p === "xtwitter") return "twitter";
  if (p === "telegram" || p === "tg" || p === "telegrambot") return "telegram";
  if (p === "bluesky" || p === "bsky") return "bluesky";
  if (p === "reddit") return "reddit";

  return isSupportedPlatform(raw) ? raw : null;
}

export function platformLabel(platform: string): string {
  const norm = normalizePlatform(platform);
  return norm
    ? PLATFORM_LABELS[norm]
    : platform.charAt(0).toUpperCase() + platform.slice(1);
}
