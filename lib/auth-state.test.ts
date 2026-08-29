import { describe, it, expect } from "vitest";
import { generateOAuthState, verifyOAuthState } from "./auth-state";

describe("OAuth State Security Manager", () => {
  const secret = "test-secret-key-32-chars-long-123456";

  it("generates a signed state and successfully validates it", () => {
    const payload = {
      workspaceId: "ws-12345",
      userId: "usr-67890",
      platform: "instagram",
      zernioProfileId: "prof-abcde",
      ttlSeconds: 60,
    };

    const token = generateOAuthState(payload, secret);
    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true);

    const verified = verifyOAuthState(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.workspaceId).toBe("ws-12345");
    expect(verified?.userId).toBe("usr-67890");
    expect(verified?.platform).toBe("instagram");
    expect(verified?.zernioProfileId).toBe("prof-abcde");
  });

  it("rejects invalid signature or tampered payload", () => {
    const token = generateOAuthState(
      { workspaceId: "ws-1", userId: "usr-1", platform: "facebook" },
      secret
    );

    // Tamper with payload
    const [payloadB64, sig] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...JSON.parse(Buffer.from(payloadB64, "base64url").toString()), workspaceId: "ws-hacked" })
    ).toString("base64url");

    const tamperedToken = `${tamperedPayload}.${sig}`;
    expect(verifyOAuthState(tamperedToken, secret)).toBeNull();

    // Wrong secret
    expect(verifyOAuthState(token, "wrong-secret-key-1234567890")).toBeNull();
  });

  it("rejects expired token", () => {
    const expiredToken = generateOAuthState(
      { workspaceId: "ws-1", userId: "usr-1", platform: "whatsapp", ttlSeconds: -10 },
      secret
    );

    expect(verifyOAuthState(expiredToken, secret)).toBeNull();
  });
});
