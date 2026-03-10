import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function UploadLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
