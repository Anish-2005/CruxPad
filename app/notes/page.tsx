"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { NotesList } from "@/components/NotesList";
import { useAuth } from "@/components/AuthProvider";
import CheatCard from "@/components/CheatCard";
import GraphView from "@/components/GraphView";
import {
  createShareLink,
  deleteNote,
  renameNote,
  subscribeToNotes,
} from "@/lib/firestore";
import { formatDate } from "@/lib/format";
import type { StoredNote } from "@/lib/types";

export default function NotesPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSelectedNoteId(params.get("noteId"));
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const unsub = subscribeToNotes(user.uid, setNotes);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (notes.length === 0) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !notes.some((note) => note.id === selectedNoteId)) {
      const fallbackId = notes[0].id;
      setSelectedNoteId(fallbackId);
      router.replace(`/notes?noteId=${fallbackId}`);
    }
  }, [notes, router, selectedNoteId]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  async function handleRename(noteId: string, currentTitle: string) {
    if (!user) return;
    const nextTitle = window.prompt("Rename cheatsheet", currentTitle)?.trim();
    if (!nextTitle || nextTitle === currentTitle) return;
    await renameNote(user.uid, noteId, nextTitle);
  }

  async function handleDelete(noteId: string) {
    if (!user) return;
    const confirmed = window.confirm("Delete this cheatsheet?");
    if (!confirmed) return;
    await deleteNote(user.uid, noteId);
  }

  async function handleShare(noteId: string) {
    if (!user) return;
    const idToken = await user.getIdToken();
    const { shareUrl } = await createShareLink(noteId, idToken);
    await navigator.clipboard.writeText(shareUrl).catch(() => null);
    setBanner(`Public link copied: ${shareUrl}`);
  }

  function handleSelect(noteId: string) {
    setSelectedNoteId(noteId);
    router.replace(`/notes?noteId=${noteId}`);
  }

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading notes...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center p-6">
        <AuthGate
          title="Sign in to view notes"
          subtitle="Access visual cheatsheet cards, exam mode notes, and knowledge graphs."
        />
      </main>
    );
  }

  return (
    <AppShell
      title="Cheatsheet Library"
      subtitle="Review cards, formulas, examples, and concept dependencies."
      user={user}
      onSignOut={signOut}
    >
      {banner ? (
        <p className="mb-6 rounded-xl border border-[#b8e9db] bg-[var(--mint-soft)] px-4 py-3 text-sm text-[#0b6f58]">
          {banner}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <NotesList
          notes={notes}
          activeNoteId={selectedNoteId}
          onSelect={handleSelect}
          onRename={handleRename}
          onDelete={handleDelete}
          onShare={handleShare}
        />

        <section className="space-y-6">
          {!selectedNote ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-secondary)]">
              Select a cheatsheet to view its cards and graph.
            </div>
          ) : (
            <>
              <article className="surface-card-strong rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)]">{selectedNote.title}</h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Updated {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedNote.mode === "exam"
                        ? "border border-[#f8d99d] bg-[var(--amber-soft)] text-[#946300]"
                        : "border border-[#b9d5ff] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                    }`}
                  >
                    {selectedNote.mode === "exam" ? "Exam Mode" : "Cheatsheet"}
                  </span>
                </div>

                {selectedNote.revisionNotes.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-4">
                    <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Ultra Short Revision</p>
                    <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                      {selectedNote.revisionNotes.map((note, index) => (
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
                  items={selectedNote.sections.keyConcepts}
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
                  items={selectedNote.sections.formulas}
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
                  items={selectedNote.sections.examples}
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
                  items={selectedNote.sections.interviewQuestions}
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
                items={selectedNote.sections.keyPoints}
                renderItem={(item, index) => (
                  <p
                    key={`${item}-${index}`}
                    className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] px-3 py-2 text-sm text-[var(--text-secondary)]"
                  >
                    - {item}
                  </p>
                )}
              />

              <GraphView graph={selectedNote.graph} />
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

