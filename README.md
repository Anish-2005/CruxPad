# CruxPad

CruxPad is a Next.js SaaS-style study tool for engineering students.

It supports:
- Firebase email/password + Google authentication
- PDF/TXT upload and parsing
- SambaNova API-powered cheatsheet generation
- Exam mode (ultra-short revision notes)
- Visual cards for concepts, formulas, examples
- Knowledge graphs using React Flow
- Public share links for generated notes

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Firebase Auth + Firestore
- SambaNova Cloud API (`/v1/chat/completions`)
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

- `SAMBANOVA_API_KEY`
- `SAMBANOVA_BASE_URL` (default: `https://api.sambanova.ai/v1`)
- `SAMBANOVA_MODEL` (default: `Meta-Llama-3.3-70B-Instruct`)
- `SAMBANOVA_FALLBACK_MODELS` (comma-separated model names)
- `NEXT_PUBLIC_FIREBASE_*` values for client SDK
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for admin routes (share links/public note fetch)

Also enable providers in Firebase Console:
- Authentication -> Sign-in method -> enable `Email/Password`
- Authentication -> Sign-in method -> enable `Google`

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
