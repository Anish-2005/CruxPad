"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { DocumentList } from "@/components/DocumentList";
import { NotesList } from "@/components/NotesList";
import { useAuth } from "@/components/AuthProvider";
import {
  createShareLink,
  deleteDocument,
  deleteNote,
  renameDocument,
  renameNote,
  subscribeToDocuments,
  subscribeToNotes,
} from "@/lib/firestore";
import type { StoredDocument, StoredNote } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setNotes([]);
      setActiveNoteId(null);
      return;
    }

    const unsubDocs = subscribeToDocuments(user.uid, setDocuments);
    const unsubNotes = subscribeToNotes(user.uid, setNotes);

    return () => {
      unsubDocs();
      unsubNotes();
    };
  }, [user]);

  useEffect(() => {
    if (notes.length === 0) {
      setActiveNoteId(null);
      return;
    }
    if (!activeNoteId || !notes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes]);

  async function handleDocumentRename(documentId: string, currentName: string) {
    if (!user) return;
    const nextName = window.prompt("Rename document", currentName)?.trim();
    if (!nextName || nextName === currentName) return;
    await renameDocument(user.uid, documentId, nextName);
  }

  async function handleDocumentDelete(documentId: string) {
    if (!user) return;
    const confirmed = window.confirm(
      "Delete this document? Linked notes will also be removed."
    );
    if (!confirmed) return;
    await deleteDocument(user.uid, documentId);
  }

  async function handleNoteRename(noteId: string, currentTitle: string) {
    if (!user) return;
    const nextTitle = window.prompt("Rename cheatsheet", currentTitle)?.trim();
    if (!nextTitle || nextTitle === currentTitle) return;
    await renameNote(user.uid, noteId, nextTitle);
  }

  async function handleNoteDelete(noteId: string) {
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
    setBanner(`Share link ready: ${shareUrl}`);
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
          title="Sign in to CruxPad"
          subtitle="Manage your documents, cheatsheets, and share links from one dashboard."
        />
      </main>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Track uploaded source files and generated study packs."
      user={user}
      onSignOut={signOut}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/upload"
          className="surface-card rounded-2xl p-4 transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
            New Upload
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            Parse PDF/TXT and generate a fresh cheatsheet.
          </p>
        </Link>
        <Link
          href="/notes"
          className="surface-card rounded-2xl p-4 transition hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0f7a5f]">
            Notes Library
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            Open visual cards, exam mode notes, and graph view.
          </p>
        </Link>
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8f4265]">
            Share Ready
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            Public links can be generated directly from any note.
          </p>
        </div>
      </div>

      {banner ? (
        <p className="mb-6 rounded-xl border border-[#b8e9db] bg-[var(--mint-soft)] px-4 py-3 text-sm text-[#0b6f58]">
          {banner}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentList
          documents={documents}
          onRename={handleDocumentRename}
          onDelete={handleDocumentDelete}
        />
        <NotesList
          notes={notes}
          activeNoteId={activeNoteId}
          onSelect={setActiveNoteId}
          onRename={handleNoteRename}
          onDelete={handleNoteDelete}
          onShare={handleShare}
        />
      </div>
    </AppShell>
  );
}
