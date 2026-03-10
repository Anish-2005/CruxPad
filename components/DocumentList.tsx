"use client";

import type { StoredDocument } from "@/lib/types";
import { formatDate, truncate } from "@/lib/format";

interface DocumentListProps {
  documents: StoredDocument[];
  onRename: (documentId: string, currentName: string) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
}

export function DocumentList({ documents, onRename, onDelete }: DocumentListProps) {
  return (
    <div className="surface-card-strong rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Uploaded Documents</h2>
        <span className="chip">{documents.length} total</span>
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border-soft)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No documents uploaded yet.
          </p>
        ) : null}

        {documents.map((document) => (
          <article
            key={document.id}
            className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">{document.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {document.sourceType.toUpperCase()} - {document.characterCount} chars -{" "}
                  {formatDate(document.updatedAt || document.createdAt)}
                </p>
              </div>

              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => onRename(document.id, document.name)}
                  className="btn-ghost tap-target flex-1 px-3 py-1.5 text-xs sm:flex-none"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(document.id)}
                  className="tap-target flex-1 rounded-lg border border-[#ffc8d2] bg-[var(--rose-soft)] px-3 py-1.5 text-xs font-semibold text-[#9f2139] transition hover:brightness-95 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {truncate(document.textPreview, 220)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
