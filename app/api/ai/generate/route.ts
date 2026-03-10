import { NextResponse } from "next/server";

import { generateStudyPack } from "@/lib/ai";
import type { StudyMode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const mode: StudyMode = body?.mode === "exam" ? "exam" : "cheatsheet";

    if (!text) {
      return NextResponse.json(
        { error: "Input text is required." },
        { status: 400 }
      );
    }

    if (text.length < 60) {
      return NextResponse.json(
        { error: "Input text is too short to generate quality notes." },
        { status: 400 }
      );
    }

    const data = await generateStudyPack(text, mode);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "AI generation failed. Verify GEMINI_API_KEY and try again.",
      },
      { status: 500 }
    );
  }
}

