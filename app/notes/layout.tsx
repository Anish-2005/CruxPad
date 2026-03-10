import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
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

export default function NotesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
