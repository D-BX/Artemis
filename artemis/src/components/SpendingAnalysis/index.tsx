"use client";

import { useState } from "react";
import Image from "next/image";

interface Transaction {
  date: string;
  merchant: string;
  category: string;
  amount: number;
}

interface ParsedData {
  transactions: Transaction[];
  totalSpent: number;
  categories: { [key: string]: number };
  weeklySpending: { week: string; amount: number }[];
  spendingRate: number;
  cashStability: number;
  budgetOverage: number;
}

interface SpendingAnalysisProps {
  data: ParsedData;
}

export default function SpendingAnalysis({ data }: SpendingAnalysisProps) {
  const [showBunnyChat, setShowBunnyChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(2000);

  const starColors = ["#0B093A", "#8482B2", "#9B5074", "#FFE8B3"];

  const formatCurrency = (value: number, maxFractionDigits = 0) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: maxFractionDigits,
    }).format(value);

  const topCategories = Object.entries(data.categories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 4);

  const getActualWeeklyData = () => {
    const weeklyData: { [key: string]: { total: number; days: Set<string> } } = {};

    data.transactions.forEach((transaction) => {
      const dateParts = transaction.date.split("/");
      if (dateParts.length >= 2) {
        const day = parseInt(dateParts[1] || dateParts[0]);
        const weekNum = Math.ceil(day / 7);
        const weekKey = `Week ${weekNum}`;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, days: new Set() };
        }
        weeklyData[weekKey].total += transaction.amount;
        weeklyData[weekKey].days.add(dateParts[0] + "/" + dateParts[1]);
      }
    });

    const result = [];
    for (let i = 1; i <= 4; i++) {
      const weekKey = `Week ${i}`;
      const weekData = weeklyData[weekKey] || { total: 0, days: new Set() };
      result.push({
        week: weekKey,
        amount: Math.round(weekData.total * 100) / 100,
        dayCount: weekData.days.size,
      });
    }

    return result;
  };

  const weeklyData = getActualWeeklyData();
  const maxWeeklySpending = Math.max(...weeklyData.map((w) => w.amount), 1);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/chat-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          spendingData: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response");
      }

      const result = await response.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that request." },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a] pb-32">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/stars-splay.svg"
          alt="stars background"
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-6 space-y-8">
        <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-3xl border border-[#FFE8B3]/20 p-6 shadow-lg">
          <div className="text-center mb-6">
            <span className="font-mono text-[#FFE8B3] text-lg tracking-wide">Weekly Spending</span>
          </div>

          <div className="relative flex items-end justify-between px-4 h-48 mb-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-1/4 border-t border-white/10" />
              <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
              <div className="absolute inset-x-0 top-3/4 border-t border-white/10" />
            </div>
            {weeklyData.map((week, idx) => {
              const barHeight = (week.amount / maxWeeklySpending) * 120;
              const moonPhase = idx / 3;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className="w-8 rounded-t-xl shadow-[0_-2px_12px_rgba(255,232,179,0.25)]"
                    style={{
                      height: `${Math.max(barHeight, 10)}px`,
                      background:
                        "linear-gradient(180deg, rgba(255,232,179,1) 0%, rgba(255,232,179,0.65) 60%, rgba(255,232,179,0.35) 100%)",
                    }}
                  />
                  <div
                    className="w-11 h-11 rounded-full shadow-md"
                    style={{
                      background: `radial-gradient(circle at ${30 + moonPhase * 40}% 30%, #FFE8B3 40%, #36336A ${40 + moonPhase * 30}%)`,
                    }}
                  />
                  <div className="font-mono text-[#FFE8B3] text-xs opacity-80">{week.week}</div>
                  <div className="font-mono text-[#FFE8B3] text-sm font-bold">{formatCurrency(week.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="flex justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
          onClick={() => setShowBunnyChat(true)}
        >
          <div className="relative">
            <Image
              src="/images/bunyunspeak.svg"
              alt="Bunny - Click to chat"
              width={180}
              height={180}
              className="object-contain drop-shadow-lg"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="font-mono text-[#FFE8B3] text-sm bg-[#36336A]/80 px-4 py-2 rounded-full border border-[#FFE8B3]/30 backdrop-blur-sm">
                click me twin ♡
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2850]/90 backdrop-blur-md rounded-3xl p-8 border border-[#FFE8B3]/10 shadow-lg">
          <div className="grid grid-cols-[auto_1fr] gap-8 items-center">
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {topCategories.reduce(
                  (acc, [category, amount], idx) => {
                    const percentage = (amount / data.totalSpent) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = acc.currentAngle;
                    const endAngle = startAngle + angle;

                    const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

                    const largeArc = angle > 180 ? 1 : 0;
                    const path = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    acc.elements.push(
                      <path
                        key={category}
                        d={path}
                        fill={starColors[idx]}
                        stroke="#5a5080"
                        strokeWidth="0.5"
                      />
                    );

                    acc.currentAngle = endAngle;
                    return acc;
                  },
                  { elements: [] as JSX.Element[], currentAngle: 0 }
                ).elements}
                <circle cx="50" cy="50" r="22" fill="#2A2850" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-2">
                  <div className="font-mono text-[#FFE8B3] text-xs mb-1 opacity-90">Total Spend:</div>
                  <div className="font-mono text-[#FFE8B3] text-[10px] opacity-60">Oct 18 - Today</div>
                  <div className="font-mono text-[#FFE8B3] text-2xl font-bold mt-1">{formatCurrency(data.totalSpent)}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="space-y-4">
                {topCategories.map(([category, amount], idx) => {
                  const percentage = data.totalSpent > 0 ? Math.round((amount / data.totalSpent) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className="inline-block h-4 w-4 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: starColors[idx] }}
                          aria-hidden
                        />
                        <span className="font-mono text-[#FFE8B3] text-base truncate">{category}</span>
                      </div>
                      <div className="flex items-baseline gap-3 flex-shrink-0">
                        <span className="font-mono text-[#FFE8B3] text-sm opacity-70">{percentage}%</span>
                        <span className="font-mono text-[#FFE8B3] text-lg font-bold">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="font-mono text-[#FFE8B3] text-lg mb-6 text-center">
            Based on your spendings.....
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-5 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-[11px] mb-3 leading-tight">
                Your spending rate is
              </div>
              <div className="font-mono text-[#FFE8B3] text-3xl font-bold mb-2">
                {formatCurrency(data.spendingRate, 0)}
              </div>
              <div className="font-mono text-[#FFE8B3] text-xs opacity-70">per day</div>
            </div>

            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-5 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-[11px] mb-3 leading-tight">
                Your cash stability score is
              </div>
              <div className="font-mono text-[#FFE8B3] text-3xl font-bold mb-2">
                {data.cashStability}
              </div>
              <div className="font-mono text-[#FFE8B3] text-xs opacity-70">
                based on your income/debt
              </div>
            </div>

            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-5 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-[11px] mb-3 leading-tight">
                You've spent
              </div>
              <div
                className={`font-mono text-3xl font-bold mb-2 ${
                  data.budgetOverage > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatCurrency(Math.abs(data.budgetOverage), 0)}
              </div>
              <div className="font-mono text-[#FFE8B3] text-xs opacity-70">
                {data.budgetOverage > 0 ? "over" : "under"} your budget
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          {isEditingBudget ? (
            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-3xl border border-[#FFE8B3]/20 p-8 shadow-lg">
              <div className="font-mono text-[#FFE8B3] text-xl mb-6">Set Monthly Budget</div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="font-mono text-[#FFE8B3] text-3xl">$</span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-2 border-[#FFE8B3]/30 rounded-xl px-6 py-4 font-mono text-[#FFE8B3] text-3xl w-52 text-center focus:outline-none focus:border-[#FFE8B3] transition-colors"
                  placeholder="2000"
                />
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="bg-[#FFE8B3] text-[#36336A] font-mono px-8 py-3 rounded-full hover:bg-[#FFE8B3]/90 transition-all hover:scale-105 shadow-md text-base font-bold"
                >
                  Save Budget
                </button>
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="bg-transparent text-[#FFE8B3] font-mono px-8 py-3 rounded-full border-2 border-[#FFE8B3]/30 hover:bg-white/10 transition-all hover:scale-105 text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingBudget(true)}
              className="bg-[#3D3A6E]/70 backdrop-blur-md text-[#FFE8B3] font-mono px-12 py-5 rounded-full border-2 border-[#FFE8B3]/30 hover:bg-[#4D4A7E] transition-all hover:scale-105 text-lg shadow-lg font-bold"
            >
              Edit Budget Goals
            </button>
          )}
        </div>
      </div>

      {showBunnyChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#36336A] to-[#5a5080] rounded-3xl border-2 border-[#FFE8B3]/30 p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/bunyunspeak.svg"
                  alt="Bunny"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <h2 className="font-mono text-[#FFE8B3] text-xl">Chat with da bun bun</h2>
              </div>
              <button
                onClick={() => setShowBunnyChat(false)}
                className="font-mono text-[#FFE8B3] text-2xl hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[300px]">
              {chatMessages.length === 0 ? (
                <div className="bg-purple-500/20 p-4 rounded-2xl">
                  <div className="font-mono text-[#FFE8B3] text-sm">
                    Howdy! Ask me anything about your spending habits and I'll help you improve your financial health!
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`font-mono text-sm p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "text-[#FFE8B3] bg-white/10 ml-8"
                        : "text-[#FFE8B3] bg-purple-500/20 mr-8"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              {isLoadingChat && (
                <div className="bg-purple-500/20 p-4 rounded-2xl mr-8">
                  <div className="font-mono text-[#FFE8B3] text-sm animate-pulse">
                    Bunny is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                placeholder="Type your question..."
                className="flex-1 bg-white/10 border border-[#FFE8B3]/30 rounded-full px-6 py-3 font-mono text-[#FFE8B3] text-sm placeholder-[#FFE8B3]/50 focus:outline-none focus:border-[#FFE8B3]"
              />
              <button
                onClick={handleChatSubmit}
                disabled={isLoadingChat || !chatInput.trim()}
                className="bg-[#FFE8B3] text-[#36336A] font-mono px-8 py-3 rounded-full hover:bg-[#FFE8B3]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
