export type StudyMode = "cheatsheet" | "exam";

export interface KeyConcept {
  title: string;
  explanation: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  description: string;
}

export interface ExampleItem {
  title: string;
  detail: string;
}

export interface InterviewQuestion {
  question: string;
  answerHint: string;
}

export interface StudySections {
  keyConcepts: KeyConcept[];
  formulas: FormulaItem[];
  examples: ExampleItem[];
  keyPoints: string[];
  interviewQuestions: InterviewQuestion[];
}

export interface GraphNode {
  id: string;
  label: string;
  group: "concept" | "formula" | "example" | "topic";
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GeneratedCheatsheet {
  title: string;
  mode: StudyMode;
  sections: StudySections;
  revisionNotes: string[];
  graph: KnowledgeGraphData;
}

export interface StoredDocument {
  id: string;
  name: string;
  originalFileName: string;
  sourceType: "pdf" | "text";
  characterCount: number;
  textPreview: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface StoredNote extends GeneratedCheatsheet {
  id: string;
  documentId: string;
  isPublic: boolean;
  shareId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

