# CruxPad

CruxPad is a Next.js SaaS-style study tool for engineering students.

It supports:
- Firebase email/password + Google authentication
- PDF/TXT upload and parsing
- Local free LLM-powered cheatsheet generation (Ollama)
- Exam mode (ultra-short revision notes)
- Visual cards for concepts, formulas, examples
- Knowledge graphs using React Flow
- Public share links for generated notes

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Firebase Auth + Firestore
- Local LLM via Ollama HTTP API
- React Flow

## Folder Structure
```
app/
  dashboard/
  upload/
  notes/
  api/
components/
  CheatCard.tsx
  GraphView.tsx
lib/
  ai.ts
  parser.ts
  firestore.ts
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill values:

- `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (default: `qwen2.5:7b`)
- `OLLAMA_FALLBACK_MODELS` (comma-separated local model names)
- `NEXT_PUBLIC_FIREBASE_*` values for client SDK
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for admin routes (share links/public note fetch)

Also enable providers in Firebase Console:
- Authentication -> Sign-in method -> enable `Email/Password`
- Authentication -> Sign-in method -> enable `Google`

Local LLM notes:
- Install Ollama locally.
- Pull one or more models, for example:
  - `ollama pull qwen2.5:7b`
  - `ollama pull llama3.2:3b`
  - `ollama pull mistral:7b`

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Note: lint is skipped during build via `next.config.mjs` because the repo currently has a legacy ESLint/Next config mismatch.
