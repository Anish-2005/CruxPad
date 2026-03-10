# CruxPad

CruxPad is a Next.js SaaS-style study tool for engineering students.

It supports:
- Firebase email/password + Google authentication
- PDF/TXT upload and parsing
- Puter-powered cheatsheet generation
- Exam mode (ultra-short revision notes)
- Visual cards for concepts, formulas, examples
- Knowledge graphs using React Flow
- Public share links for generated notes

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Firebase Auth + Firestore
- Puter AI SDK (`https://js.puter.com/v2/`)
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

- `NEXT_PUBLIC_PUTER_MODEL` (default: `openai/gpt-5.2-pro`)
- `NEXT_PUBLIC_FIREBASE_*` values for client SDK
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for admin routes (share links/public note fetch)

Also enable providers in Firebase Console:
- Authentication -> Sign-in method -> enable `Email/Password`
- Authentication -> Sign-in method -> enable `Google`

Puter notes:
- Puter JS is loaded in the app layout.
- On first generation call, users may be prompted by Puter to authenticate/authorize.

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
