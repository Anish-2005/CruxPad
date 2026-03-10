"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/components/AuthProvider";

interface AuthGateProps {
  title: string;
  subtitle: string;
}

export function AuthGate({ title, subtitle }: AuthGateProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setBusy(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface-card-strong fade-up mx-auto w-full max-w-md rounded-3xl p-8">
      <div className="mb-6">
        <p className="chip mb-3 inline-flex">Secure Access</p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
      </div>

      <div className="inline-flex rounded-xl border border-[var(--border-soft)] bg-[#f6f9ff] p-1 text-sm">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 font-medium ${
            mode === "signin"
              ? "bg-[var(--brand)] text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
          onClick={() => setMode("signin")}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 font-medium ${
            mode === "signup"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:text-slate-900"
          }`}
          onClick={() => setMode("signup")}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="btn-ghost flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 3.1l6-6C34.3 3 29.5 1 24 1 14.6 1 6.5 6.4 2.6 14.2l7 5.4C11.7 13.4 17.3 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.7-.2-3.3-.5-4.8H24v9.1h12.6c-.5 2.8-2.1 5.1-4.4 6.7l6.8 5.2c4-3.7 6.3-9.2 6.3-16.2z" />
            <path fill="#FBBC05" d="M9.6 28.4c-.5-1.3-.8-2.8-.8-4.4s.3-3 .8-4.4l-7-5.4C1 17.4 0 20.6 0 24s1 6.6 2.6 9.8l7-5.4z" />
            <path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.8-5.8L33 36c-2.2 1.5-5.1 2.5-9 2.5-6.7 0-12.3-3.9-14.4-10.1l-7 5.4C6.5 41.6 14.6 47 24 47z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-soft)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--panel-strong)] px-2 text-[var(--text-muted)]">or use email</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[var(--text-secondary)]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[var(--border-soft)] bg-[#fbfdff] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d8e8ff]"
            placeholder="student@university.edu"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[var(--text-secondary)]">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[var(--border-soft)] bg-[#fbfdff] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d8e8ff]"
            placeholder="Minimum 6 characters"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-[#ffc8d2] bg-[var(--rose-soft)] px-3 py-2 text-sm text-[#9f2139]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed"
        >
          {busy
            ? "Working..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>
    </section>
  );
}
