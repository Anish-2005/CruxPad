import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

function normalize(text: string) {
  return text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isFileLike(value: unknown): value is File {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "arrayBuffer" in (value as any) &&
    typeof (value as any).arrayBuffer === "function" &&
    "name" in (value as any)
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!isFileLike(file)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileType = (file.type || "").toLowerCase();
    const fileName = file.name.toLowerCase();
    const isPdf = fileType.includes("pdf") || fileName.endsWith(".pdf");
    const isText = fileType.startsWith("text/") || fileName.endsWith(".txt");

    let text = "";
    if (isPdf) {
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        const result = await pdfParse(buffer);
        text = result.text || "";
      } catch (error: any) {
        return NextResponse.json(
          {
            error:
              error?.message ||
              "Could not parse PDF. If this is image-only/scanned, run OCR first.",
          },
          { status: 400 }
        );
      }
    } else if (isText) {
      text = await file.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF or TXT." },
        { status: 400 }
      );
    }

    const normalized = normalize(text);
    if (!normalized) {
      return NextResponse.json(
        {
          error:
            "No extractable text found in the file. For scanned PDFs, use OCR before upload.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: normalized });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to extract document text." },
      { status: 500 }
    );
  }
}
