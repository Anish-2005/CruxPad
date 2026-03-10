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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Generated Cheatsheets</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {notes.length} total
        </span>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
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
                  ? "border-blue-300 bg-blue-50/60"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(note.id)}
                  className="text-left"
                >
                  <h3 className="font-semibold text-slate-900">{note.title}</h3>
                  <p className="text-xs text-slate-500">
                    {note.mode === "exam" ? "Exam Mode" : "Cheatsheet"} ·{" "}
                    {formatDate(note.updatedAt || note.createdAt)}
                  </p>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onShare(note.id)}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => onRename(note.id, note.title)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
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

