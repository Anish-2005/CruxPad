import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The requested cheatsheet does not exist or is no longer public.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to CruxPad Home
        </Link>
      </section>
    </main>
  );
}

