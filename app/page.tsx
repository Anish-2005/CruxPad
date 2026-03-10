import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 bg-[radial-gradient(circle_at_15%_15%,#bfdbfe_0,transparent_35%),radial-gradient(circle_at_85%_0,#fecdd3_0,transparent_32%),linear-gradient(180deg,#f8fafc,#e2e8f0)]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <span className="rounded-full border border-slate-300 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
          SaaS Study Platform
        </span>
        <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          CruxPad for Engineering Revision
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Upload lecture notes or textbooks, generate visual cheatsheet cards, build exam-mode
          revision packs, and inspect concept dependencies with a live knowledge graph.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Dashboard
          </Link>
          <Link
            href="/upload"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Upload Document
          </Link>
          <Link
            href="/notes"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View Notes
          </Link>
        </div>
      </section>
    </main>
  );
}

