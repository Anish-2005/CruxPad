export interface ParsedUpload {
  text: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export function normalizeInputText(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

export async function parseUploadedFile(file: File): Promise<ParsedUpload> {
  const supportedMime =
    file.type === "application/pdf" || file.type === "text/plain";

  if (!supportedMime) {
    throw new Error("Only PDF and plain text files are supported.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "Failed to parse uploaded file.";
    throw new Error(message);
  }

  const payload = (await response.json()) as { text: string };

  return {
    text: normalizeInputText(payload.text || ""),
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

