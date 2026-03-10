import { ReactNode } from "react";

interface CheatCardProps<T> {
  title: string;
  helper?: string;
  items: T[];
  emptyLabel?: string;
  renderItem: (item: T, index: number) => ReactNode;
}

export default function CheatCard<T>({
  title,
  helper,
  items,
  emptyLabel = "No items available yet.",
  renderItem,
}: CheatCardProps<T>) {
  return (
    <section className="surface-card-strong rounded-2xl p-5">
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
          {helper ? <p className="text-xs text-[var(--text-muted)]">{helper}</p> : null}
        </div>
        <span className="chip w-fit">{items.length}</span>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border-soft)] px-3 py-4 text-sm text-[var(--text-muted)]">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-3">{items.map((item, index) => renderItem(item, index))}</div>
      )}
    </section>
  );
}
