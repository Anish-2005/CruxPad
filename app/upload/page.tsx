"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/components/AuthProvider";
import CheatCard from "@/components/CheatCard";
import GraphView from "@/components/GraphView";
import { generateStudyPackWithSambaNova } from "@/lib/ai-client";
import { createStudyPackRecords } from "@/lib/firestore";
import { normalizeInputText, parseUploadedFile } from "@/lib/parser";
import type { GeneratedCheatsheet, StudyMode } from "@/lib/types";

function stripExt(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

interface PendingStudyPack {
  generated: GeneratedCheatsheet;
  sourceType: "pdf" | "text";
  originalFileName: string;
  characterCount: number;
  textPreview: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [mode, setMode] = useState<StudyMode>("cheatsheet");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pendingResult, setPendingResult] = useState<PendingStudyPack | null>(null);

  const sourcePreview = useMemo(() => {
    if (file) {
      return `${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
    if (rawText.trim()) {
      return `Manual text (${rawText.trim().length} chars)`;
    }
    return "No source selected yet";
  }, [file, rawText]);

  const previewTitle = pendingResult
    ? title.trim() ||
      pendingResult.generated.title ||
      stripExt(pendingResult.originalFileName) ||
      "Untitled Study Pack"
    : "";

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setBusy(true);
    setError("");
    setPendingResult(null);
    setStatus("Extracting source text...");

    try {
      let sourceText = normalizeInputText(rawText);
      let sourceType: "pdf" | "text" = "text";
      let originalFileName = "manual-input.txt";

      if (file) {
        const parsed = await parseUploadedFile(file);
        sourceText = parsed.text;
        const isPdf =
          (parsed.mimeType || "").toLowerCase().includes("pdf") ||
          parsed.fileName.toLowerCase().endsWith(".pdf");
        sourceType = isPdf ? "pdf" : "text";
        originalFileName = parsed.fileName;
      }

      if (!sourceText) {
        throw new Error("Please upload a file or paste text before generating notes.");
      }

      setStatus("Generating AI study pack with SambaNova...");
      const generated = await generateStudyPackWithSambaNova(sourceText, mode);
      setPendingResult({
        generated,
        sourceType,
        originalFileName,
        characterCount: sourceText.length,
        textPreview: sourceText.slice(0, 280),
      });
      setStatus("Preview ready. Review below and choose whether to save to Firestore.");
    } catch (err: any) {
      setError(err?.message || "Generation failed.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!user || !pendingResult) return;

    setSaving(true);
    setError("");
    setStatus("Saving document and cheatsheet...");

    try {
      const finalTitle =
        title.trim() ||
        pendingResult.generated.title ||
        stripExt(pendingResult.originalFileName) ||
        "Untitled Study Pack";

      const { noteId } = await createStudyPackRecords(user.uid, {
        document: {
          name: stripExt(pendingResult.originalFileName) || finalTitle,
          originalFileName: pendingResult.originalFileName,
          sourceType: pendingResult.sourceType,
          characterCount: pendingResult.characterCount,
          textPreview: pendingResult.textPreview,
        },
        note: {
          ...pendingResult.generated,
          title: finalTitle,
          mode: pendingResult.generated.mode,
        },
      });

      setStatus("Saved. Redirecting to notes...");
      router.push(`/notes?noteId=${noteId}`);
    } catch (err: any) {
      setError(err?.message || "Save failed.");
      setStatus("");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscardPreview() {
    setPendingResult(null);
    setError("");
    setStatus("Preview discarded. Nothing was saved to Firestore.");
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
      subtitle="Generate first, review full results, then decide whether to save."
      user={user}
      onSignOut={signOut}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleGenerate} className="surface-card-strong rounded-2xl p-4 sm:p-5">
          <div className="mb-4 sm:mb-5">
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

          <div className="mb-4 sm:mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">Mode</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("cheatsheet")}
                className={`tap-target rounded-xl border p-3 text-left ${
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
                className={`tap-target rounded-xl border p-3 text-left ${
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

          <div className="mb-4 sm:mb-5">
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

          <div className="mb-4 sm:mb-5">
            <label className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
              Or Paste Text
            </label>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Paste lecture notes or textbook excerpt..."
              rows={10}
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
            disabled={busy || saving}
            className="btn-primary tap-target w-full px-5 py-3 text-sm disabled:cursor-not-allowed"
          >
            {busy ? "Generating..." : "Generate Preview"}
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
              <li>- Preview first, then save (or skip) explicitly</li>
            </ul>
          </div>

          <Link href="/dashboard" className="btn-ghost tap-target block rounded-2xl p-5 text-sm">
            Back to dashboard
          </Link>
        </aside>
      </div>

      {pendingResult ? (
        <section className="mt-8 space-y-6">
          <article className="surface-card-strong rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-2xl">{previewTitle}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Source: {pendingResult.originalFileName} | {pendingResult.characterCount} chars
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  pendingResult.generated.mode === "exam"
                    ? "border border-[#f8d99d] bg-[var(--amber-soft)] text-[#946300]"
                    : "border border-[#b9d5ff] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                }`}
              >
                {pendingResult.generated.mode === "exam" ? "Exam Mode" : "Cheatsheet"}
              </span>
            </div>

            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Save this generated study pack to Firestore?
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || busy}
                className="btn-primary tap-target w-full px-4 py-2 text-sm disabled:cursor-not-allowed sm:w-auto"
              >
                {saving ? "Saving..." : "Save to Firestore"}
              </button>
              <button
                type="button"
                onClick={handleDiscardPreview}
                disabled={saving || busy}
                className="tap-target w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[#f8fbff] disabled:cursor-not-allowed sm:w-auto"
              >
                Don&apos;t Save
              </button>
            </div>

            {pendingResult.generated.revisionNotes.length > 0 ? (
              <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-4">
                <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  Ultra Short Revision
                </p>
                <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                  {pendingResult.generated.revisionNotes.map((note, index) => (
                    <li key={`${note}-${index}`}>- {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          <div className="grid gap-6 xl:grid-cols-2">
            <CheatCard
              title="Key Concepts"
              helper="Core engineering ideas extracted from your source."
              items={pendingResult.generated.sections.keyConcepts}
              renderItem={(item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.explanation}</p>
                </article>
              )}
            />

            <CheatCard
              title="Formulas"
              helper="Important equations for quick recall."
              items={pendingResult.generated.sections.formulas}
              renderItem={(item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                  <p className="mt-1 rounded-md border border-[#c8eadf] bg-white px-2 py-1 font-mono text-sm text-[#0b6f58]">
                    {item.formula}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</p>
                </article>
              )}
            />

            <CheatCard
              title="Examples"
              helper="Applied scenarios for conceptual clarity."
              items={pendingResult.generated.sections.examples}
              renderItem={(item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.detail}</p>
                </article>
              )}
            />

            <CheatCard
              title="Interview Questions"
              helper="Likely viva/interview prompts and answer direction."
              items={pendingResult.generated.sections.interviewQuestions}
              renderItem={(item, index) => (
                <article
                  key={`${item.question}-${index}`}
                  className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.question}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.answerHint}</p>
                </article>
              )}
            />
          </div>

          <CheatCard
            title="Key Points"
            helper="High-yield points for revision drills."
            items={pendingResult.generated.sections.keyPoints}
            renderItem={(item, index) => (
              <p
                key={`${item}-${index}`}
                className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] px-3 py-2 text-sm text-[var(--text-secondary)]"
              >
                - {item}
              </p>
            )}
          />

          <GraphView graph={pendingResult.generated.graph} />
        </section>
      ) : null}
    </AppShell>
  );
}
