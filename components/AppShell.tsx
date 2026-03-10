"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { LogOut } from "lucide-react";

import BrandLogo from "@/components/BrandLogo";
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
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/">
              <BrandLogo />
            </Link>
          </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden text-right md:block">
                <p className="max-w-[180px] truncate text-sm font-semibold text-[var(--text-primary)] sm:max-w-[260px]">
                  {user.email}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Authenticated</p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="btn-ghost tap-target inline-flex items-center gap-1.5 px-3 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          <nav className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto rounded-xl border border-[var(--border-soft)] bg-white p-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "tap-target whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition",
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="surface-card-strong mb-6 rounded-3xl p-4 fade-up sm:mb-8 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip mb-3 inline-flex items-center">Study Workspace</p>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
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
