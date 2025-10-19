// app/report/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import TransactionsTable, { Purchase } from "@/components/TransactionTable";

export const metadata: Metadata = {
  title: "Credit Report",
  description: "This is a generated credit report",
};

const purchases: Purchase[] = [
  { id: 101, item: "Laptop", date: "2025-09-12", amount: 1199.0 },
  { id: 102, item: "Coffee", date: "2025-10-01", amount: 4.75 },
  { id: 103, item: "Groceries", date: "2025-09-28", amount: 86.43 },
  { id: 104, item: "Gym Membership", date: "2025-10-05", amount: 45.0 },
];

export default function Report() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

      {/* Decorative star scatter (left) */}
      <div
        className="absolute left-0 top-[20%] -translate-x-1/2 z-10 pointer-events-none"
        aria-hidden="true"
      >
        <Image
          src="/images/star_scat_L.svg"
          alt=""
          width={200}
          height={200}
          className="object-contain opacity-80"
          priority
        />
      </div>

      {/* Content wrapper (normal flow for vertical positioning) */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-24 space-y-16">
        {/* Titles */}
        <div className="text-center">
          <h1 className="font-mono text-5xl md:text-6xl text-[#FFE8B3] drop-shadow-md">
            Credit Report
          </h1>
          <p className="font-mono text-xl md:text-2xl text-white/90 mt-4">
            Your personalized results
          </p>
        </div>

        {/* Credit Score section */}
        <div className="text-center">
          <p className="font-mono text-3xl md:text-4xl text-[#FFE8B3] mb-10">
            Your credit score
          </p>

          {/* Moon image */}
          <div
            className="relative w-full max-w-5xl aspect-[2430/611] bg-no-repeat bg-center bg-contain mx-auto"
            style={{ backgroundImage: "url('/images/moon_stars.svg')" }}
          >
            {/* Score overlay */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <p className="tabular-nums font-mono text-6xl md:text-7xl font-bold text-black drop-shadow text-center leading-none">
                100
              </p>
            </div>
          </div>

          {/* Text below SVG */}
          <p className="mt-8 font-mono text-xl md:text-2xl text-[#FFE8B3] text-center">
            Excellent Credit — Keep up the great work!
          </p>
        </div>

        {/* Transactions Table */}
        <div className="w-[min(92vw,1100px)]">
          <TransactionsTable data={purchases} />
        </div>
      </div>
    </div>
  );
}
