# CruxPad

CruxPad is a Next.js SaaS-style study tool for engineering students.

It supports:
- Firebase email/password authentication
- PDF/TXT upload and parsing
- Gemini-powered cheatsheet generation
- Exam mode (ultra-short revision notes)
- Visual cards for concepts, formulas, examples
- Knowledge graphs using React Flow
- Public share links for generated notes

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Firebase Auth + Firestore
- Gemini API (`@google/generative-ai`)
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

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_*` values for client SDK
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for admin routes (share links/public note fetch)

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

