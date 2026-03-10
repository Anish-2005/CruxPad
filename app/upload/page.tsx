"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/components/AuthProvider";
import { generateStudyPackFromApi } from "@/lib/ai-client";
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

      setStatus("Generating AI study pack...");
      const generated = await generateStudyPackFromApi(sourceText, mode);
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading workspace...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
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
        <form
          onSubmit={handleGenerate}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Study Pack Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Signals & Systems Unit 3"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Mode</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("cheatsheet")}
                className={`rounded-xl border p-3 text-left ${
                  mode === "cheatsheet"
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">Cheatsheet</p>
                <p className="mt-1 text-xs text-slate-600">
                  Key concepts + formulas + examples.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode("exam")}
                className={`rounded-xl border p-3 text-left ${
                  mode === "exam"
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">Exam Mode</p>
                <p className="mt-1 text-xs text-slate-600">
                  Ultra short revision points + interview questions.
                </p>
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Upload Source File
            </label>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-700"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Or Paste Text
            </label>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Paste lecture notes or textbook excerpt..."
              rows={12}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error ? (
            <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {status ? (
            <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {status}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {busy ? "Generating..." : "Generate Study Pack"}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Current Source</h2>
            <p className="mt-2 text-sm text-slate-600">{sourcePreview}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Output Includes</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Visual cards for concepts, formulas, and examples</li>
              <li>• Exam mode key points + interview questions</li>
              <li>• Knowledge dependency graph (React Flow)</li>
              <li>• Persisted notes with rename/delete/share controls</li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="block rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}

