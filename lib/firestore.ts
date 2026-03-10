import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { GeneratedCheatsheet, StoredDocument, StoredNote } from "@/lib/types";

interface DocumentInput {
  name: string;
  originalFileName: string;
  sourceType: "pdf" | "text";
  characterCount: number;
  textPreview: string;
}

interface NoteInput extends GeneratedCheatsheet {
  documentId: string;
}

function toIsoString(value: any): string | null {
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

function mapDocument(docSnap: any): StoredDocument {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || "Untitled",
    originalFileName: data.originalFileName || "unknown",
    sourceType: data.sourceType === "pdf" ? "pdf" : "text",
    characterCount: Number(data.characterCount || 0),
    textPreview: data.textPreview || "",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapNote(docSnap: any): StoredNote {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title || "Untitled Note",
    mode: data.mode === "exam" ? "exam" : "cheatsheet",
    documentId: data.documentId || "",
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
    isPublic: Boolean(data.isPublic),
    shareId: data.shareId || null,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export function subscribeToDocuments(
  uid: string,
  onData: (docs: StoredDocument[]) => void
) {
  const ref = collection(db, "users", uid, "documents");
  const q = query(ref, orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(mapDocument));
  });
}

export function subscribeToNotes(uid: string, onData: (notes: StoredNote[]) => void) {
  const ref = collection(db, "users", uid, "notes");
  const q = query(ref, orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map(mapNote));
  });
}

export async function createDocumentRecord(uid: string, input: DocumentInput) {
  const ref = collection(db, "users", uid, "documents");
  const docRef = await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createNoteRecord(uid: string, input: NoteInput) {
  const ref = collection(db, "users", uid, "notes");
  const docRef = await addDoc(ref, {
    ...input,
    isPublic: false,
    shareId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function renameDocument(uid: string, documentId: string, name: string) {
  const ref = doc(db, "users", uid, "documents", documentId);
  await updateDoc(ref, {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function renameNote(uid: string, noteId: string, title: string) {
  const ref = doc(db, "users", uid, "notes", noteId);
  await updateDoc(ref, {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, noteId: string) {
  const ref = doc(db, "users", uid, "notes", noteId);
  await deleteDoc(ref);
}

export async function deleteDocument(uid: string, documentId: string) {
  const documentRef = doc(db, "users", uid, "documents", documentId);
  const notesRef = collection(db, "users", uid, "notes");
  const notesSnapshot = await getDocs(
    query(notesRef, where("documentId", "==", documentId))
  );

  const batch = writeBatch(db);
  batch.delete(documentRef);
  notesSnapshot.forEach((noteDoc) => batch.delete(noteDoc.ref));
  await batch.commit();
}

export async function createShareLink(noteId: string, idToken: string) {
  const response = await fetch("/api/notes/share", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ noteId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "Failed to create share link.";
    throw new Error(message);
  }

  return (await response.json()) as { shareId: string; shareUrl: string };
}

