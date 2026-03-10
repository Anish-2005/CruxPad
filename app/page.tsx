import Link from "next/link";
import { ArrowRight, FileText, Network, Sparkles, Zap } from "lucide-react";

import BrandLogo from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <main className="app-background app-grid relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,#ecf6ff_0%,transparent_43%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-20">
        <BrandLogo className="mb-4 w-fit" tagline="AI Revision Workspace for Engineers" />
        <span className="chip w-fit">SaaS Study Platform</span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          Professional revision workspace for engineering students
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          Transform bulky PDFs into sharp study assets: visual cheatsheet cards, exam-mode rapid notes,
          and concept dependency graphs you can actually revise from.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/dashboard"
            className="btn-primary tap-target inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm sm:w-auto"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="btn-ghost tap-target w-full px-5 py-3 text-center text-sm sm:w-auto"
          >
            Upload Document
          </Link>
          <Link
            href="/notes"
            className="btn-ghost tap-target w-full px-5 py-3 text-center text-sm sm:w-auto"
          >
            View Notes
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="surface-card rounded-2xl p-5 fade-up">
            <FileText className="h-5 w-5 text-[var(--brand)]" />
            <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">Structured Cards</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Key concepts, formulas, and examples are segmented into scan-friendly cards.
            </p>
          </article>
          <article className="surface-card rounded-2xl p-5 fade-up [animation-delay:90ms]">
            <Zap className="h-5 w-5 text-[var(--brand)]" />
            <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">Exam Mode</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Ultra-short revision lines and interview prompts for quick sprint prep.
            </p>
          </article>
          <article className="surface-card rounded-2xl p-5 fade-up [animation-delay:160ms]">
            <Network className="h-5 w-5 text-[var(--brand)]" />
            <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">Knowledge Graph</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Visual dependency maps show prerequisite flow across concepts.
            </p>
          </article>
        </div>

        <p className="mt-8 inline-flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Sparkles className="h-3.5 w-3.5" />
          Optimized for desktop and mobile
        </p>
      </section>
    </main>
  );
}
