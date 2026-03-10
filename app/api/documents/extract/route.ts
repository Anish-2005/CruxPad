import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

function normalize(text: string) {
  return text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileType = file.type || "";
    const fileName = file.name.toLowerCase();

    let text = "";
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await pdfParse(buffer);
      text = result.text || "";
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      text = await file.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF or TXT." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: normalize(text) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to extract document text." },
      { status: 500 }
    );
  }
}

