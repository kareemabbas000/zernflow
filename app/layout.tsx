import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "KA COMM — AI-Powered Omnichannel Communication",
    template: "%s | KA COMM",
  },
  description:
    "Manage customer conversations across Facebook, Instagram, WhatsApp, X, and Telegram with a unified inbox, visual automations, and AI agents.",
  metadataBase: new URL("https://kacomm.com"),
  openGraph: {
    title: "KA COMM — AI-Powered Omnichannel Communication",
    description:
      "Every conversation in one intelligent workspace. Seamless messaging across Facebook, Instagram, WhatsApp, X, and Telegram.",
    url: "https://kacomm.com",
    siteName: "KA COMM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KA COMM — AI-Powered Omnichannel Communication",
    description:
      "Manage all your customer conversations from one intelligent workspace with AI and automation.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark"||(!localStorage.getItem("theme")&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${plusJakarta.className} font-sans min-h-screen bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
