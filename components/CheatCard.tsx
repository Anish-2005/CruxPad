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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {items.length}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-3">{items.map((item, index) => renderItem(item, index))}</div>
      )}
    </section>
  );
}

