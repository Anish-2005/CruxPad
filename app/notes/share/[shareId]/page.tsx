import Link from "next/link";
import { notFound } from "next/navigation";

import CheatCard from "@/components/CheatCard";
import GraphView from "@/components/GraphView";
import { getPublicNoteByShareId } from "@/lib/public-notes";
import { formatDate } from "@/lib/format";

interface SharedNotePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const note = await getPublicNoteByShareId(params.shareId);
  if (!note) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Shared via CruxPad
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {note.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {note.mode === "exam" ? "Exam Mode" : "Cheatsheet"} · Updated{" "}
            {formatDate(note.updatedAt || note.createdAt)}
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Open CruxPad
            </Link>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <CheatCard
            title="Key Concepts"
            items={note.sections.keyConcepts}
            renderItem={(item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>
              </article>
            )}
          />

          <CheatCard
            title="Formulas"
            items={note.sections.formulas}
            renderItem={(item, index) => (
              <article
                key={`${item.name}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 rounded-md bg-white px-2 py-1 font-mono text-sm text-emerald-700">
                  {item.formula}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </article>
            )}
          />
        </div>

        <CheatCard
          title="Examples"
          items={note.sections.examples}
          renderItem={(item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            </article>
          )}
        />

        <CheatCard
          title="Key Points"
          items={note.sections.keyPoints}
          renderItem={(item, index) => (
            <p
              key={`${item}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              • {item}
            </p>
          )}
        />

        <CheatCard
          title="Interview Questions"
          items={note.sections.interviewQuestions}
          renderItem={(item, index) => (
            <article
              key={`${item.question}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.question}</p>
              <p className="mt-1 text-sm text-slate-600">{item.answerHint}</p>
            </article>
          )}
        />

        <GraphView graph={note.graph} />
      </div>
    </main>
  );
}

