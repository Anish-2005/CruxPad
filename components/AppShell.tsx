"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";

import { cn } from "@/lib/utils";

interface AppShellProps {
  title: string;
  subtitle: string;
  user: User;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/notes", label: "Notes" },
];

export function AppShell({
  title,
  subtitle,
  user,
  onSignOut,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(circle_at_5%_20%,#bfdbfe_0,transparent_28%),radial-gradient(circle_at_90%_0%,#fbcfe8_0,transparent_32%),linear-gradient(180deg,#f8fafc,#f1f5f9)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="text-xl font-black tracking-tight text-slate-900">
              CruxPad
            </Link>
            <p className="text-xs text-slate-500">Engineering Study Workspace</p>
          </div>

          <nav className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{user.email}</p>
              <p className="text-xs text-slate-500">Authenticated</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </section>
        {children}
      </main>
    </div>
  );
}

