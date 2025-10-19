import type { Metadata } from "next";
import Image from "next/image";
import TransactionsTable, { Purchase } from "@/components/TransactionTable";
import CreditScoreSection from "@/components/TransactionTable/credit";

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

// Make the component async to trigger the loading screen
export default async function Report() {
  // Simulate data loading - remove or adjust this delay as needed
  await new Promise(resolve => setTimeout(resolve, 3000));

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

      {/* Decorative star scatter */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/images/stars-splay.svg"
          alt="stars background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-24 space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-mono text-5xl md:text-6xl text-[#FFE8B3] drop-shadow-md">
            Credit Report
          </h1>
          <p className="font-mono text-xl md:text-2xl text-white/90 mt-4">
            Your personalized results
          </p>
        </div>

        {/* CREDIT SCORE SECTION */}
        <div className="w-full flex flex-col items-center text-center space-y-10">
          <CreditScoreSection />
        </div>

        {/* CREDIT USAGE SECTION */}
        <div className="text-center">
          <h2 className="font-serif text-[#FFE8B3] text-3xl md:text-4xl mb-4">
            CREDIT USAGE
          </h2>
          <p className="font-mono text-white/90 mb-6">
            Your account has a credit usage of
          </p>

          <div className="relative flex justify-center items-center">
            <div className="bg-[#FFE8B3] rounded-full w-48 h-48 flex justify-center items-center shadow-[0_0_40px_rgba(255,232,179,0.4)]">
              <p className="font-serif text-[#2f2d54] text-6xl font-bold">655</p>
            </div>
          </div>

          <p className="mt-6 font-mono text-white/90">
            based on your current balance and credit limit
          </p>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="w-[min(92vw,1100px)]">
          <TransactionsTable
            data={purchases}
            bunnySrc="/images/talk_bun.svg"
            showBubble
          />
        </div>
      </div>
    </div>
  );
}