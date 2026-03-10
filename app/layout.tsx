import type { Metadata } from "next";
import Script from "next/script";

import Providers from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CruxPad | Engineering Study SaaS",
    template: "%s | CruxPad",
  },
  description:
    "Upload engineering docs, generate AI cheatsheets, exam notes, and concept graphs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
