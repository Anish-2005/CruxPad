"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { LogOut, Sparkles } from "lucide-react";

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
    <div className="app-background">
      <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[#f8fbffdb] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">
              <Sparkles className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div>
              <Link href="/" className="text-xl font-black tracking-tight text-[var(--text-primary)]">
                CruxPad
              </Link>
              <p className="text-xs text-[var(--text-muted)]">Engineering Study Workspace</p>
            </div>
          </div>

          <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-xl border border-[var(--border-soft)] bg-white p-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition whitespace-nowrap",
                    active
                      ? "bg-[var(--brand)] text-white shadow-[0_8px_20px_rgba(15,91,216,0.28)]"
                      : "text-[var(--text-secondary)] hover:bg-[#edf3ff]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="max-w-[180px] truncate text-sm font-semibold text-[var(--text-primary)] sm:max-w-[260px]">
                {user.email}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Authenticated</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <section className="surface-card-strong mb-8 rounded-3xl p-6 fade-up">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip mb-3 inline-flex items-center">Study Workspace</p>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
                {subtitle}
              </p>
            </div>
            <div className="hidden rounded-2xl border border-[var(--border-soft)] bg-[#eef4ff] px-4 py-2 text-xs font-semibold text-[var(--brand-strong)] lg:block">
              Optimized for speed and focused revision
            </div>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}
