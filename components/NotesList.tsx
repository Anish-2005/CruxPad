"use client";

import type { StoredNote } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface NotesListProps {
  notes: StoredNote[];
  activeNoteId?: string | null;
  onSelect: (noteId: string) => void;
  onRename: (noteId: string, title: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  onShare: (noteId: string) => Promise<void>;
}

export function NotesList({
  notes,
  activeNoteId,
  onSelect,
  onRename,
  onDelete,
  onShare,
}: NotesListProps) {
  return (
    <div className="surface-card-strong rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Generated Cheatsheets</h2>
        <span className="chip">{notes.length} total</span>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border-soft)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No notes generated yet.
          </p>
        ) : null}

        {notes.map((note) => {
          const isActive = note.id === activeNoteId;

          return (
            <article
              key={note.id}
              className={`rounded-xl border p-4 transition ${
                isActive
                  ? "border-[#b9d5ff] bg-[var(--brand-soft)]/70"
                  : "border-[var(--border-soft)] bg-[#f8fbff] hover:border-[#c3d8f3]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button type="button" onClick={() => onSelect(note.id)} className="text-left">
                  <h3 className="font-semibold text-[var(--text-primary)]">{note.title}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {note.mode === "exam" ? "Exam Mode" : "Cheatsheet"} -{" "}
                    {formatDate(note.updatedAt || note.createdAt)}
                  </p>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onShare(note.id)}
                    className="rounded-lg border border-[#b8e9db] bg-[var(--mint-soft)] px-3 py-1.5 text-xs font-semibold text-[#0b6f58] transition hover:brightness-95"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => onRename(note.id, note.title)}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
                    className="rounded-lg border border-[#ffc8d2] bg-[var(--rose-soft)] px-3 py-1.5 text-xs font-semibold text-[#9f2139] transition hover:brightness-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

