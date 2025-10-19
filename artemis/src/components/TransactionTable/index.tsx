"use client";
import React from "react";

export type Purchase = {
  id: number | string;
  item: string;     // e.g., "Groceries"
  date: string;     // ISO date "2025-08-16" or any displayable string
  amount: number;   // 54.32
};

type Props = {
  data?: Purchase[];
  title?: string;
  /** Tailwind class for scroll height (defaults to responsive max height) */
  maxHeightClass?: string;
};

const sampleData: Purchase[] = [
  { id: 1, item: "Groceries",           date: "2025-08-16", amount: 54.32 },
  { id: 2, item: "Online Subscription", date: "2025-08-20", amount: 12.99 },
  { id: 3, item: "Gas",                 date: "2025-09-01", amount: 42.87 },
  { id: 4, item: "Restaurant",          date: "2025-09-04", amount: 28.5  },
];

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function sortByDateDesc(rows: Purchase[]) {
  // If date is ISO, this works well; otherwise falls back to original order
  return [...rows].sort((a, b) => {
    const da = Date.parse(a.date);
    const db = Date.parse(b.date);
    if (Number.isNaN(da) || Number.isNaN(db)) return 0;
    return db - da;
  });
}

export default function TransactionsTable({
  data,
  title = "TRANSACTIONS",
  maxHeightClass = "max-h-[min(56vh,620px)]",
}: Props) {
  const rows = sortByDateDesc(data && data.length ? data : sampleData);

  return (
    <section className="w-full">
      {/* Title */}
      <header className="text-center mb-6 md:mb-8">
        <h2 className="font-serif tracking-[0.18em] text-[clamp(28px,4vw,40px)] text-[#FFE8B3]">
          {title}
        </h2>
      </header>

      {/* Panel */}
      <div className="rounded-[22px] bg-[#0b0a22] p-[clamp(10px,2vw,18px)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        {/* Header row */}
        <div
          role="row"
          className="rounded-t-[16px] bg-[#121232] px-4 py-3 grid grid-cols-[1fr_minmax(120px,220px)_minmax(120px,220px)] gap-x-8"
        >
          <div role="columnheader" className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">
            Purchases
          </div>
          <div role="columnheader" className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">
            Date
          </div>
          <div role="columnheader" className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">
            Amount
          </div>
        </div>

        {/* Body / scroll area */}
        <div
          role="rowgroup"
          className={`relative mt-2 overflow-y-auto rounded-b-[16px] ${maxHeightClass}`}
        >
          {rows.length === 0 ? (
            <div className="px-4 py-6 text-center font-mono text-white/70">
              No transactions yet.
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={r.id}
                role="row"
                className={`grid grid-cols-[1fr_minmax(120px,220px)_minmax(120px,220px)] gap-x-8 items-center px-4 py-4 ${
                  i % 2 ? "bg-white/5" : ""
                }`}
              >
                <div role="cell" className="font-mono text-white/90">{r.item}</div>
                <div role="cell" className="font-mono text-white/80">
                  {r.date}
                </div>
                <div role="cell" className="font-mono text-white/80">
                  {formatCurrency(r.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Optional: subtle custom scrollbar (webkit) */}
      <style jsx>{`
        div[role='rowgroup']::-webkit-scrollbar { width: 8px; }
        div[role='rowgroup']::-webkit-scrollbar-track { background: rgba(255,255,255,0.08); border-radius: 8px; }
        div[role='rowgroup']::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.9); border-radius: 8px; }
      `}</style>
    </section>
  );
}
