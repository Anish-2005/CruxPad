import type {
  GeneratedCheatsheet,
  GraphEdge,
  GraphNode,
  StudyMode,
  StudySections,
} from "@/lib/types";

const MODEL_PRIORITY = [
  process.env.NEXT_PUBLIC_PUTER_MODEL || "openai/gpt-5.2-pro",
  "openai/gpt-5.2-chat",
  "claude-sonnet-4",
  "gpt-5-nano",
];

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

function extractText(response: any) {
  if (typeof response === "string") {
    return response;
  }
  if (typeof response?.text === "string") {
    return response.text;
  }
  if (typeof response?.message?.content === "string") {
    return response.message.content;
  }
  if (typeof response?.choices?.[0]?.message?.content === "string") {
    return response.choices[0].message.content;
  }
  return JSON.stringify(response || "");
}

async function waitForPuter(timeoutMs = 12_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.puter?.ai?.chat) {
      return window.puter;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error("Puter SDK failed to load. Refresh and try again.");
}

async function runWithModel(prompt: string, model: string) {
  const puter = await waitForPuter();
  return puter.ai.chat(prompt, {
    model,
    temperature: 0.2,
  });
}

export async function generateStudyPackWithPuter(
  text: string,
  mode: StudyMode
): Promise<GeneratedCheatsheet> {
  const prompt = buildPrompt(text, mode);

  let lastError: unknown = null;
  for (const model of MODEL_PRIORITY) {
    try {
      const response = await runWithModel(prompt, model);
      const rawText = extractText(response);
      const parsed = parseJsonFromModel(rawText);
      const sanitized = sanitizePayload(parsed, mode);

      if (
        sanitized.sections.keyConcepts.length === 0 &&
        sanitized.sections.formulas.length === 0 &&
        sanitized.sections.examples.length === 0 &&
        sanitized.sections.keyPoints.length === 0
      ) {
        sanitized.sections.keyPoints = [
          "AI output did not contain structured items. Retry generation with a cleaner source document.",
        ];
      }

      return sanitized;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Puter generation failed for all configured models."
  );
}

