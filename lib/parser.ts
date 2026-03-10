export interface ParsedUpload {
  text: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export function normalizeInputText(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

function isSupportedUpload(file: File) {
  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isPdf = mime.includes("pdf") || name.endsWith(".pdf");
  const isText = mime.startsWith("text/") || name.endsWith(".txt");
  return isPdf || isText;
}

export async function parseUploadedFile(file: File): Promise<ParsedUpload> {
  if (!isSupportedUpload(file)) {
    throw new Error("Only PDF and plain text files are supported.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let message = "Failed to parse uploaded file.";
    try {
      const payload = JSON.parse(raw);
      if (typeof payload?.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    } catch {
      if (raw.trim()) {
        message = `Failed to parse uploaded file (HTTP ${response.status}): ${raw
          .trim()
          .slice(0, 220)}`;
      } else {
        message = `Failed to parse uploaded file (HTTP ${response.status}).`;
      }
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as { text: string };
  const normalized = normalizeInputText(payload.text || "");

  if (!normalized) {
    throw new Error(
      "The uploaded file produced empty text. For scanned PDFs, OCR is required before upload."
    );
  }

  return {
    text: normalized,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}
