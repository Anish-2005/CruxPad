import type { Metadata, Viewport } from "next";

import Providers from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CruxPad | Engineering Study SaaS",
    template: "%s | CruxPad",
  },
  description:
    "Upload engineering docs, generate AI cheatsheets, exam notes, and concept graphs.",
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
