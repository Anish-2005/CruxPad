import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="app-background flex min-h-screen items-center justify-center p-6">
      <section className="surface-card-strong w-full max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Page Not Found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The requested cheatsheet does not exist or is no longer public.
        </p>
        <Link href="/" className="btn-primary mt-5 inline-block px-4 py-2 text-sm">
          Go to CruxPad Home
        </Link>
      </section>
    </main>
  );
}
