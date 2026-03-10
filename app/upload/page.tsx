"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/components/AuthProvider";
import { generateStudyPackWithPuter } from "@/lib/ai-client";
import { createDocumentRecord, createNoteRecord } from "@/lib/firestore";
import { normalizeInputText, parseUploadedFile } from "@/lib/parser";
import type { StudyMode } from "@/lib/types";

function stripExt(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

export default function UploadPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [mode, setMode] = useState<StudyMode>("cheatsheet");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const sourcePreview = useMemo(() => {
    if (file) {
      return `${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
    if (rawText.trim()) {
      return `Manual text (${rawText.trim().length} chars)`;
    }
    return "No source selected yet";
  }, [file, rawText]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setBusy(true);
    setError("");
    setStatus("Extracting source text...");

    try {
      let sourceText = normalizeInputText(rawText);
      let sourceType: "pdf" | "text" = "text";
      let originalFileName = "manual-input.txt";

      if (file) {
        const parsed = await parseUploadedFile(file);
        sourceText = parsed.text;
        sourceType = parsed.mimeType === "application/pdf" ? "pdf" : "text";
        originalFileName = parsed.fileName;
      }

      if (!sourceText) {
        throw new Error("Please upload a file or paste text before generating notes.");
      }

      setStatus("Generating AI study pack with Puter...");
      const generated = await generateStudyPackWithPuter(sourceText, mode);
      const finalTitle =
        title.trim() || generated.title || stripExt(originalFileName) || "Untitled Study Pack";

      setStatus("Saving document and cheatsheet...");
      const documentId = await createDocumentRecord(user.uid, {
        name: stripExt(originalFileName) || finalTitle,
        originalFileName,
        sourceType,
        characterCount: sourceText.length,
        textPreview: sourceText.slice(0, 280),
      });

      const noteId = await createNoteRecord(user.uid, {
        ...generated,
        title: finalTitle,
        mode,
        documentId,
      });

      setStatus("Done. Redirecting to notes...");
      router.push(`/notes?noteId=${noteId}`);
    } catch (err: any) {
      setError(err?.message || "Generation failed.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading workspace...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center p-6">
        <AuthGate
          title="Sign in to upload"
          subtitle="Authenticate to create and save AI study packs."
        />
      </main>
    );
  }

  return (
    <AppShell
      title="Upload & Generate"
      subtitle="Create standard cheatsheets or exam-mode ultra-short revision notes."
      user={user}
      onSignOut={signOut}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleGenerate} className="surface-card-strong rounded-2xl p-5">
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
              Study Pack Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Signals & Systems Unit 3"
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[#fbfdff] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d8e8ff]"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">Mode</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("cheatsheet")}
                className={`rounded-xl border p-3 text-left ${
                  mode === "cheatsheet"
                    ? "border-[#84aceb] bg-[#ebf3ff]"
                    : "border-[var(--border-soft)] bg-[#f8fbff]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">Cheatsheet</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Key concepts + formulas + examples.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode("exam")}
                className={`rounded-xl border p-3 text-left ${
                  mode === "exam"
                    ? "border-[#99d9c6] bg-[#edfbf6]"
                    : "border-[var(--border-soft)] bg-[#f8fbff]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">Exam Mode</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Ultra short revision points + interview questions.
                </p>
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
              Upload Source File
            </label>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="block w-full cursor-pointer rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--brand)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[var(--brand-strong)]"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
              Or Paste Text
            </label>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Paste lecture notes or textbook excerpt..."
              rows={12}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[#fbfdff] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d8e8ff]"
            />
          </div>

          {error ? (
            <p className="mb-4 rounded-xl border border-[#ffc8d2] bg-[var(--rose-soft)] px-4 py-3 text-sm text-[#9f2139]">
              {error}
            </p>
          ) : null}

          {status ? (
            <p className="mb-4 rounded-xl border border-[#b9d5ff] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand-strong)]">
              {status}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed"
          >
            {busy ? "Generating..." : "Generate Study Pack"}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="surface-card rounded-2xl p-5">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Current Source</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{sourcePreview}</p>
          </div>

          <div className="surface-card rounded-2xl p-5">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Output Includes</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>- Visual cards for concepts, formulas, and examples</li>
              <li>- Exam mode key points + interview questions</li>
              <li>- Knowledge dependency graph (React Flow)</li>
              <li>- Persisted notes with rename/delete/share controls</li>
            </ul>
          </div>

          <Link href="/dashboard" className="btn-ghost block rounded-2xl p-5 text-sm">
            Back to dashboard
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}

