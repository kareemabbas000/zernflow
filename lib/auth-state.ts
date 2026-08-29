/**
 * Cryptographic OAuth State Manager
 *
 * Secures OAuth handshakes with social providers / Zernio.
 * Signs workspaceId, userId, platform, and expiry timestamp with HMAC-SHA256
 * using SUPABASE_SERVICE_ROLE_KEY or a dedicated secret to prevent CSRF,
 * tenant tampering, and account misattribution.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export interface OAuthStatePayload {
  workspaceId: string;
  userId: string;
  platform: string;
  zernioProfileId?: string;
  nonce: string;
  expiresAt: number; // Unix timestamp ms
}

function getSigningSecret(secretOverride?: string): string {
  if (secretOverride) return secretOverride;
  const secret =
    process.env.OAUTH_STATE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.CRON_SECRET ||
    "default-internal-platform-signing-secret-key-32b";
  return secret;
}

/**
 * Creates a tamper-proof base64url signed state string.
 * Valid for 30 minutes by default.
 */
export function generateOAuthState(
  params: {
    workspaceId: string;
    userId: string;
    platform: string;
    zernioProfileId?: string;
    ttlSeconds?: number;
  },
  secretOverride?: string
): string {
  const ttl = params.ttlSeconds ?? 1800; // 30 mins
  const payload: OAuthStatePayload = {
    workspaceId: params.workspaceId,
    userId: params.userId,
    platform: params.platform,
    zernioProfileId: params.zernioProfileId,
    nonce: randomBytes(16).toString("hex"),
    expiresAt: Date.now() + ttl * 1000,
  };

  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr).toString("base64url");
  const signature = createHmac("sha256", getSigningSecret(secretOverride))
    .update(dataB64)
    .digest("base64url");

  return `${dataB64}.${signature}`;
}

/**
 * Validates and unpacks a signed OAuth state string.
 * Returns null if expired, tampered with, or malformed.
 */
export function verifyOAuthState(
  stateString: string | null | undefined,
  secretOverride?: string
): OAuthStatePayload | null {
  if (!stateString || typeof stateString !== "string") return null;

  const parts = stateString.split(".");
  if (parts.length !== 2) return null;

  const [dataB64, providedSig] = parts;
  if (!dataB64 || !providedSig) return null;

  const expectedSig = createHmac("sha256", getSigningSecret(secretOverride))
    .update(dataB64)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (providedBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(providedBuf, expectedBuf)) return null;

  try {
    const payload: OAuthStatePayload = JSON.parse(
      Buffer.from(dataB64, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.expiresAt) {
      console.warn("[OAuthState] State expired at:", new Date(payload.expiresAt).toISOString());
      return null;
    }

    if (!payload.workspaceId || !payload.userId || !payload.platform) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[OAuthState] Failed to parse state payload:", err);
    return null;
  }
}

export const validateOAuthState = verifyOAuthState;
