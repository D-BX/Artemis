"use client";
import React from "react";

export type Purchase = {
  id: number | string;
  item: string;
  date: string;
  amount: number;
};

type Props = {
  data?: Purchase[];
  title?: string;
  maxHeightClass?: string;
  bunnySrc?: string;
  bunnySizeClass?: string;
  showBubble?: boolean;
};

const sampleData: Purchase[] = [
  { id: 1, item: "Item", date: "08/16", amount: 230.53 },
  { id: 2, item: "Item", date: "08/16", amount: 230.53 },
  { id: 3, item: "Item", date: "08/16", amount: 230.53 },
];

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export default function TransactionsTable({
  data,
  title = "TRANSACTIONS",
  maxHeightClass = "max-h-[min(56vh,620px)]",
  bunnySrc = "/images/bunny.svg",
  bunnySizeClass = "w-[180px] md:w-[220px]",
  showBubble = true,
}: Props) {
  const rows = data && data.length ? data : sampleData;
  const total = rows.length;

  return (
    <section className="w-full">
      {/* Outer container */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#2f2d54] p-5 md:p-7">
        {/* Title at top */}
        <h2 className="font-mono tracking-[0.18em] text-[clamp(28px,4vw,36px)] text-[#FFE8B3] text-center mb-6">
          {title}
        </h2>

        {/* Transactions window */}
        <div className="rounded-[22px] bg-[#0b0a22] border border-[#121232]/60 p-[clamp(10px,2vw,18px)]">
          {/* Header bar */}
          <div className="rounded-t-[16px] bg-[#121232] px-4 py-3 grid grid-cols-[1fr_minmax(120px,220px)_minmax(120px,220px)] gap-x-8">
            <div className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">Purchases</div>
            <div className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">Date</div>
            <div className="font-mono text-[clamp(12px,1.3vw,16px)] text-white/85">Amount</div>
          </div>

          {/* Scroll area */}
          <div className={`mt-2 overflow-y-auto rounded-b-[16px] ${maxHeightClass}`} role="rowgroup">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={`grid grid-cols-[1fr_minmax(120px,220px)_minmax(120px,220px)] gap-x-8 items-center px-4 py-4 ${
                  i % 2 ? "bg-white/5" : ""
                }`}
                role="row"
              >
                <div className="font-mono text-white/90" role="cell">
                  {r.item}
                </div>
                <div className="font-mono text-white/80" role="cell">
                  {r.date}
                </div>
                <div className="font-mono text-white/80" role="cell">
                  {formatCurrency(r.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section: speech bubble + bunny */}
        <div className="relative mt-8 flex flex-col items-center md:flex-row md:justify-between gap-6 min-h-[160px]">
          {/* Left side: speech bubble */}
          {showBubble && (
            <div
              aria-hidden="true"
              className={`
                relative bg-white/90 text-black
                rounded-[22px] px-5 md:px-6 py-4 md:py-5
                w-[min(540px,85%)] md:w-auto
                self-center md:self-start
              `}
            >
              <p className="font-mono text-[clamp(16px,2.2vw,20px)] leading-snug text-center md:text-left">
                You have a total of <span className="tabular-nums font-bold">{total}</span> transactions
              </p>
              <div className="absolute -right-3 bottom-6 w-6 h-6 bg-white/90 rotate-45 rounded-[4px]" />
            </div>
          )}

          {/* Bunny (right) */}
          {bunnySrc && (
            <img
              src={bunnySrc}
              alt=""
              aria-hidden="true"
              className={`pointer-events-none select-none ${bunnySizeClass} opacity-95 md:ml-auto`}
            />
          )}
        </div>
      </div>

      {/* Custom scrollbar */}
      <style jsx>{`
        div[role='rowgroup']::-webkit-scrollbar {
          width: 8px;
        }
        div[role='rowgroup']::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }
        div[role='rowgroup']::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
        }
      `}</style>
    </section>
  );
}