import "server-only";

import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import type { StoredNote } from "@/lib/types";

function toIso(value: any): string | null {
  if (!value) {
    return null;
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
}

export async function getPublicNoteByShareId(
  shareId: string
): Promise<StoredNote | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  const ref = adminDb.collection("publicNotes").doc(shareId);
  const snap = await ref.get();
  if (!snap.exists) {
    return null;
  }

  const data = snap.data() || {};

  return {
    id: data.noteId || shareId,
    documentId: data.documentId || "",
    title: data.title || "Shared Cheatsheet",
    mode: data.mode === "exam" ? "exam" : "cheatsheet",
    sections: {
      keyConcepts: data.sections?.keyConcepts || [],
      formulas: data.sections?.formulas || [],
      examples: data.sections?.examples || [],
      keyPoints: data.sections?.keyPoints || [],
      interviewQuestions: data.sections?.interviewQuestions || [],
    },
    revisionNotes: data.revisionNotes || [],
    graph: {
      nodes: data.graph?.nodes || [],
      edges: data.graph?.edges || [],
    },
    isPublic: true,
    shareId,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

