import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Gabarito, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "../../i18n";

export const metadata: Metadata = {
  title: {
    default: "FlowStage — AI-Powered Omnichannel Communication",
    template: "%s | FlowStage",
  },
  description:
    "Manage customer conversations across Facebook, Instagram, WhatsApp, X, and Telegram with a unified inbox, visual automations, and AI agents.",
  metadataBase: new URL("https://flowstage.com"),
  openGraph: {
    title: "FlowStage — AI-Powered Omnichannel Communication",
    description:
      "Every conversation in one intelligent workspace. Seamless messaging across Facebook, Instagram, WhatsApp, X, and Telegram.",
    url: "https://flowstage.com",
    siteName: "FlowStage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowStage — AI-Powered Omnichannel Communication",
    description:
      "Manage all your customer conversations from one intelligent workspace with AI and automation.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  console.log("LAYOUT LOCALE IS:", locale, "PARAMS ARE:", await params);
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${plusJakarta.variable} ${gabarito.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className={`${plusJakarta.className} font-sans min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
