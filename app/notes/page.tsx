"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const requestedNoteId = searchParams.get("noteId");
  const { user, loading, signOut } = useAuth();

  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    requestedNoteId
  );
  const [banner, setBanner] = useState("");

  useEffect(() => {
    setSelectedNoteId(requestedNoteId);
  }, [requestedNoteId]);

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
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading notes...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
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
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              Select a cheatsheet to view its cards and graph.
            </div>
          ) : (
            <>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedNote.title}</h2>
                    <p className="text-xs text-slate-500">
                      Updated {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedNote.mode === "exam"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedNote.mode === "exam" ? "Exam Mode" : "Cheatsheet"}
                  </span>
                </div>

                {selectedNote.revisionNotes.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-slate-800">Ultra Short Revision</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {selectedNote.revisionNotes.map((note, index) => (
                        <li key={`${note}-${index}`}>• {note}</li>
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
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>
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
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 rounded-md bg-white px-2 py-1 font-mono text-sm text-emerald-700">
                        {item.formula}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
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
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
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
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.answerHint}</p>
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
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    • {item}
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

