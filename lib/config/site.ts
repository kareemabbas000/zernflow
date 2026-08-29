/**
 * Centralized SaaS Branding & Site Configuration — KA COMM
 * 
 * Configures the application identity, product positioning, and legal attributions.
 */

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  author: string;
  supportEmail: string;
  companyName: string;
  copyrightYear: number;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

export const siteConfig: SiteConfig = {
  name: "KA COMM",
  tagline: "AI-Powered Omnichannel Communication Platform",
  description:
    "Every conversation in one intelligent workspace. Manage customer messaging across Facebook, Instagram, WhatsApp, X, and Telegram with AI copilot and visual automations.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  author: "Kareem Abbas",
  supportEmail: "support@kacomm.com",
  companyName: "KA COMM",
  copyrightYear: new Date().getFullYear(),
  logo: {
    src: "/logo.png",
    alt: "KA COMM",
    width: 36,
    height: 36,
  },
};
