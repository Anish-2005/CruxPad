import type { Metadata, Viewport } from "next";

import Providers from "@/app/providers";
import "./globals.css";

const siteUrl = "https://cruxpad.vercel.app";
const siteName = "CruxPad";
const defaultTitle = "CruxPad | AI Study Workspace for Engineering Students";
const defaultDescription =
  "CruxPad turns engineering PDFs and notes into structured cheatsheets, exam revision bullets, interview prep, and concept graphs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | CruxPad",
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "engineering study app",
    "AI notes generator",
    "cheatsheet generator",
    "exam revision notes",
    "concept graph",
    "PDF to notes",
    "student productivity",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    siteName,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CruxPad - AI study workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f5bd8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
