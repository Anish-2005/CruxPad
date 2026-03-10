import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

import {
  getAdminAuth,
  getAdminDb,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

function extractBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return header.slice(7).trim();
}

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Share links need Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.",
        },
        { status: 500 }
      );
    }

    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
    }

    const payload = await request.json();
    const noteId = typeof payload?.noteId === "string" ? payload.noteId : "";
    if (!noteId) {
      return NextResponse.json({ error: "noteId is required." }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const noteRef = adminDb.collection("users").doc(uid).collection("notes").doc(noteId);
    const noteSnap = await noteRef.get();

    if (!noteSnap.exists) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const noteData = noteSnap.data() || {};
    const shareId = noteData.shareId || nanoid(10);
    const origin = new URL(request.url).origin;
    const shareUrl = `${origin}/notes/share/${shareId}`;

    await adminDb
      .collection("publicNotes")
      .doc(shareId)
      .set(
        {
          ...noteData,
          noteId,
          ownerId: uid,
          shareId,
          sharedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    await noteRef.set(
      {
        shareId,
        isPublic: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ shareId, shareUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create share link." },
      { status: 500 }
    );
  }
}

