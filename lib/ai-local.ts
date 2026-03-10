import "server-only";

import type {
  GeneratedCheatsheet,
  GraphEdge,
  GraphNode,
  StudyMode,
  StudySections,
} from "@/lib/types";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";

const OLLAMA_PRIMARY_MODEL = process.env.OLLAMA_MODEL?.trim() || "qwen2.5:7b";

const OLLAMA_FALLBACK_MODELS = (
  process.env.OLLAMA_FALLBACK_MODELS ||
  "llama3.2:3b,mistral:7b,phi3:mini"
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

async function getInstalledOllamaModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };
    const models = payload.models || [];
    return models
      .map((item) => item.name || item.model || "")
      .map((name) => name.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function chooseModelCandidates(installed: string[]) {
  const preferred = [OLLAMA_PRIMARY_MODEL, ...OLLAMA_FALLBACK_MODELS];
  const installedSet = new Set(installed);
  const candidates: string[] = [];

  for (const model of preferred) {
    if (installedSet.has(model) && !candidates.includes(model)) {
      candidates.push(model);
    }
  }

  for (const model of preferred) {
    if (!candidates.includes(model)) {
      candidates.push(model);
    }
  }

  return candidates;
}

async function runOllama(model: string, prompt: string) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.2,
        num_ctx: 8192,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Ollama request failed (${response.status}).`);
  }

  const payload = (await response.json()) as { response?: string };
  if (!payload?.response) {
    throw new Error("Ollama returned an empty response.");
  }

  return payload.response;
}

export async function generateStudyPackWithLocalLLM(
  text: string,
  mode: StudyMode
): Promise<GeneratedCheatsheet> {
  const prompt = buildPrompt(text, mode);
  const installed = await getInstalledOllamaModels();
  const candidates = chooseModelCandidates(installed);
  const errors: string[] = [];

  for (const model of candidates) {
    try {
      const raw = await runOllama(model, prompt);
      const parsed = parseJsonFromModel(raw);
      const sanitized = sanitizePayload(parsed, mode);

      if (
        sanitized.sections.keyConcepts.length === 0 &&
        sanitized.sections.formulas.length === 0 &&
        sanitized.sections.examples.length === 0 &&
        sanitized.sections.keyPoints.length === 0
      ) {
        sanitized.sections.keyPoints = [
          "Local model returned thin output. Retry or use a stronger local model.",
        ];
      }

      return sanitized;
    } catch (error: any) {
      errors.push(`${model}: ${cleanText(error?.message || String(error))}`);
    }
  }

  throw new Error(
    `Local LLM generation failed. Ensure Ollama is running on ${OLLAMA_BASE_URL} and install one of: ${[
      OLLAMA_PRIMARY_MODEL,
      ...OLLAMA_FALLBACK_MODELS,
    ].join(", ")}. Details: ${errors.join(" | ")}`
  );
}

