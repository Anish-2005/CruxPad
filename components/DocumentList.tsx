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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Uploaded Documents</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {documents.length} total
        </span>
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
            No documents uploaded yet.
          </p>
        ) : null}

        {documents.map((document) => (
          <article
            key={document.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{document.name}</h3>
                <p className="text-xs text-slate-500">
                  {document.sourceType.toUpperCase()} · {document.characterCount} chars ·{" "}
                  {formatDate(document.updatedAt || document.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRename(document.id, document.name)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(document.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600">{truncate(document.textPreview, 220)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

