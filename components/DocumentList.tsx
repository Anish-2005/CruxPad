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
      <div className="mb-4 flex items-center justify-between">
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
            className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{document.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {document.sourceType.toUpperCase()} - {document.characterCount} chars -{" "}
                  {formatDate(document.updatedAt || document.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRename(document.id, document.name)}
                  className="btn-ghost px-3 py-1.5 text-xs"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(document.id)}
                  className="rounded-lg border border-[#ffc8d2] bg-[var(--rose-soft)] px-3 py-1.5 text-xs font-semibold text-[#9f2139] transition hover:brightness-95"
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

