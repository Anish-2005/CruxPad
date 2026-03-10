import Link from "next/link";
import { notFound } from "next/navigation";

import CheatCard from "@/components/CheatCard";
import GraphView from "@/components/GraphView";
import { formatDate } from "@/lib/format";
import { getPublicNoteByShareId } from "@/lib/public-notes";

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
    <main className="app-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="surface-card-strong rounded-2xl p-6">
          <p className="chip inline-flex">Shared via CruxPad</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {note.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {note.mode === "exam" ? "Exam Mode" : "Cheatsheet"} - Updated{" "}
            {formatDate(note.updatedAt || note.createdAt)}
          </p>
          <div className="mt-4">
            <Link href="/" className="btn-ghost px-3 py-2 text-sm">
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
                className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.explanation}</p>
              </article>
            )}
          />

          <CheatCard
            title="Formulas"
            items={note.sections.formulas}
            renderItem={(item, index) => (
              <article
                key={`${item.name}-${index}`}
                className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                <p className="mt-1 rounded-md border border-[#c8eadf] bg-white px-2 py-1 font-mono text-sm text-[#0b6f58]">
                  {item.formula}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</p>
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
              className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.detail}</p>
            </article>
          )}
        />

        <CheatCard
          title="Key Points"
          items={note.sections.keyPoints}
          renderItem={(item, index) => (
            <p
              key={`${item}-${index}`}
              className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] px-3 py-2 text-sm text-[var(--text-secondary)]"
            >
              - {item}
            </p>
          )}
        />

        <CheatCard
          title="Interview Questions"
          items={note.sections.interviewQuestions}
          renderItem={(item, index) => (
            <article
              key={`${item.question}-${index}`}
              className="rounded-xl border border-[var(--border-soft)] bg-[#f8fbff] p-3"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.question}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.answerHint}</p>
            </article>
          )}
        />

        <GraphView graph={note.graph} />
      </div>
    </main>
  );
}

