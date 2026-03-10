import type { GeneratedCheatsheet, StudyMode } from "@/lib/types";

interface GenerateResponse {
  data: GeneratedCheatsheet;
}

export async function generateStudyPackWithLocalLLM(
  text: string,
  mode: StudyMode
): Promise<GeneratedCheatsheet> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, mode }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "Local AI generation failed.";
    throw new Error(message);
  }

  const payload = (await response.json()) as GenerateResponse;
  return payload.data;
}

