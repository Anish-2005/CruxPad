interface PuterAI {
  chat: (
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      stream?: boolean;
      [key: string]: unknown;
    }
  ) => Promise<unknown>;
}

interface PuterGlobal {
  ai: PuterAI;
}

declare global {
  interface Window {
    puter?: PuterGlobal;
  }
}

export {};

