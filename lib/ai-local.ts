import "server-only";

import type {
  GeneratedCheatsheet,
  GraphEdge,
  GraphNode,
  StudyMode,
  StudySections,
} from "@/lib/types";

const SAMBANOVA_BASE_URL = (
  process.env.SAMBANOVA_BASE_URL?.trim() || "https://api.sambanova.ai/v1"
).replace(/\/+$/, "");

const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY?.trim() || "";

const SAMBANOVA_PRIMARY_MODEL =
  process.env.SAMBANOVA_MODEL?.trim() || "Meta-Llama-3.3-70B-Instruct";

const SAMBANOVA_FALLBACK_MODELS = (
  process.env.SAMBANOVA_FALLBACK_MODELS ||
  "DeepSeek-V3.1,DeepSeek-V3-0324,Meta-Llama-3.1-8B-Instruct"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const BASE_SCHEMA = `Return only valid JSON with this exact shape:
{
  "title": "string",
  "sections": {
    "keyConcepts": [{ "title": "string", "explanation": "string" }],
    "formulas": [{ "name": "string", "formula": "string", "description": "string" }],
    "examples": [{ "title": "string", "detail": "string" }],
    "keyPoints": ["string"],
    "interviewQuestions": [{ "question": "string", "answerHint": "string" }]
  },
  "revisionNotes": ["string"],
  "graph": {
    "nodes": [{ "id": "string", "label": "string", "group": "concept|formula|example|topic" }],
    "edges": [{ "source": "string", "target": "string", "label": "string" }]
  }
}`;

function buildPrompt(text: string, mode: StudyMode) {
  const modeInstructions =
    mode === "exam"
      ? `You are in EXAM MODE.
- Produce ultra-short revision-ready notes.
- Prioritize formulas, high-yield facts, and likely viva/interview questions.
- Keep each key point under 18 words where possible.`
      : `You are in CHEATSHEET MODE.
- Produce concise but conceptually complete study notes.
- Keep explanations short and engineering-focused.`;

  return `${modeInstructions}

${BASE_SCHEMA}

Rules:
- Do not include markdown fences.
- Keep total output compact and skimmable.
- Build a dependency graph where foundational nodes point to advanced nodes.
- Prefer ASCII symbols in formulas where possible.

Source text:
${text.slice(0, 300_000)}`;
}

function cleanText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim().replace(/\s+/g, " ");
}

function parseJsonFromModel(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || raw;
  return JSON.parse(candidate);
}

function sanitizeSections(input: any): StudySections {
  const keyConcepts = Array.isArray(input?.keyConcepts)
    ? input.keyConcepts
        .map((item: any) => ({
          title: cleanText(item?.title),
          explanation: cleanText(item?.explanation),
        }))
        .filter((item: any) => item.title && item.explanation)
        .slice(0, 16)
    : [];

  const formulas = Array.isArray(input?.formulas)
    ? input.formulas
        .map((item: any) => ({
          name: cleanText(item?.name),
          formula: cleanText(item?.formula),
          description: cleanText(item?.description),
        }))
        .filter((item: any) => item.name && item.formula)
        .slice(0, 16)
    : [];

  const examples = Array.isArray(input?.examples)
    ? input.examples
        .map((item: any) => ({
          title: cleanText(item?.title),
          detail: cleanText(item?.detail),
        }))
        .filter((item: any) => item.title && item.detail)
        .slice(0, 12)
    : [];

  const keyPoints = Array.isArray(input?.keyPoints)
    ? input.keyPoints
        .map((point: any) => cleanText(point))
        .filter(Boolean)
        .slice(0, 24)
    : [];

  const interviewQuestions = Array.isArray(input?.interviewQuestions)
    ? input.interviewQuestions
        .map((item: any) => ({
          question: cleanText(item?.question),
          answerHint: cleanText(item?.answerHint),
        }))
        .filter((item: any) => item.question)
        .slice(0, 12)
    : [];

  return {
    keyConcepts,
    formulas,
    examples,
    keyPoints,
    interviewQuestions,
  };
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return slug || "node";
}

function sanitizeNodes(input: any): GraphNode[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const nodes: GraphNode[] = [];

  for (const candidate of input) {
    const label = cleanText(candidate?.label);
    const rawId = cleanText(candidate?.id, slugify(label));
    const id = slugify(rawId);
    const rawGroup = cleanText(candidate?.group, "topic");
    const group: GraphNode["group"] =
      rawGroup === "concept" ||
      rawGroup === "formula" ||
      rawGroup === "example" ||
      rawGroup === "topic"
        ? rawGroup
        : "topic";

    if (!id || !label || seen.has(id)) {
      continue;
    }

    seen.add(id);
    nodes.push({ id, label, group });
    if (nodes.length >= 28) {
      break;
    }
  }

  return nodes;
}

function sanitizeEdges(input: any, nodeIds: Set<string>): GraphEdge[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const candidate of input) {
    const source = slugify(cleanText(candidate?.source));
    const target = slugify(cleanText(candidate?.target));
    const label = cleanText(candidate?.label);
    const key = `${source}->${target}`;

    if (!source || !target || source === target || seen.has(key)) {
      continue;
    }
    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      continue;
    }

    seen.add(key);
    edges.push({ source, target, label });
    if (edges.length >= 40) {
      break;
    }
  }

  return edges;
}

function sanitizePayload(raw: any, mode: StudyMode): GeneratedCheatsheet {
  const sections = sanitizeSections(raw?.sections);
  const nodes = sanitizeNodes(raw?.graph?.nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = sanitizeEdges(raw?.graph?.edges, nodeIds);
  const revisionNotes = Array.isArray(raw?.revisionNotes)
    ? raw.revisionNotes
        .map((note: any) => cleanText(note))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return {
    title: cleanText(raw?.title, "Generated Study Pack"),
    mode,
    sections,
    revisionNotes,
    graph: {
      nodes,
      edges,
    },
  };
}

type SambaNovaResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function chooseModelCandidates() {
  const preferred = [SAMBANOVA_PRIMARY_MODEL, ...SAMBANOVA_FALLBACK_MODELS];
  const candidates: string[] = [];

  for (const model of preferred) {
    if (model && !candidates.includes(model)) {
      candidates.push(model);
    }
  }

  return candidates;
}

async function runSambaNova(model: string, prompt: string) {
  const response = await fetch(`${SAMBANOVA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SAMBANOVA_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      stream: false,
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const rawError = await response.text().catch(() => "");
    let parsedMessage = "";

    if (rawError) {
      try {
        parsedMessage = cleanText(
          ((JSON.parse(rawError) as SambaNovaResponse)?.error?.message || "").trim()
        );
      } catch {
        parsedMessage = "";
      }
    }

    const message =
      parsedMessage ||
      cleanText(rawError) ||
      `SambaNova request failed (${response.status}).`;
    throw new Error(message);
  }

  const payload = (await response.json()) as SambaNovaResponse;
  const content = payload?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("SambaNova returned an empty response.");
  }

  return content;
}

export async function generateStudyPackWithSambaNova(
  text: string,
  mode: StudyMode
): Promise<GeneratedCheatsheet> {
  if (!SAMBANOVA_API_KEY) {
    throw new Error(
      "SambaNova API key is missing. Set SAMBANOVA_API_KEY in your environment."
    );
  }

  const prompt = buildPrompt(text, mode);
  const candidates = chooseModelCandidates();
  const errors: string[] = [];

  for (const model of candidates) {
    try {
      const raw = await runSambaNova(model, prompt);
      const parsed = parseJsonFromModel(raw);
      const sanitized = sanitizePayload(parsed, mode);

      if (
        sanitized.sections.keyConcepts.length === 0 &&
        sanitized.sections.formulas.length === 0 &&
        sanitized.sections.examples.length === 0 &&
        sanitized.sections.keyPoints.length === 0
      ) {
        sanitized.sections.keyPoints = [
          "SambaNova model returned thin output. Retry or switch the model.",
        ];
      }

      return sanitized;
    } catch (error: any) {
      errors.push(`${model}: ${cleanText(error?.message || String(error))}`);
    }
  }

  throw new Error(
    `SambaNova AI generation failed via ${SAMBANOVA_BASE_URL}. Tried models: ${[
      SAMBANOVA_PRIMARY_MODEL,
      ...SAMBANOVA_FALLBACK_MODELS,
    ].join(", ")}. Details: ${errors.join(" | ")}`
  );
}

export async function generateStudyPackWithLocalLLM(
  text: string,
  mode: StudyMode
): Promise<GeneratedCheatsheet> {
  return generateStudyPackWithSambaNova(text, mode);
}
