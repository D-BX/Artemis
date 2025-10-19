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
  dailySpending?: { date: string; amount: number }[];
  spendingRate: number;
  cashStability: number;
  budgetOverage: number;
  daysInPeriod?: number;
  monthlyBudget?: number;
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
  const [budgetAmount, setBudgetAmount] = useState(data.monthlyBudget || 2000);
  const [currentBudgetOverage, setCurrentBudgetOverage] = useState(data.budgetOverage);
  const [showReward, setShowReward] = useState(false);

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

  const handleSaveBudget = () => {
    const newOverage = data.totalSpent - budgetAmount;
    setCurrentBudgetOverage(newOverage);
    setIsEditingBudget(false);

    if (newOverage <= 0) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 5000);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-y-auto bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/stars-splay.svg"
          alt="stars background"
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 pb-24">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/smartbalancing.svg"
            alt="Smart Balancing"
            width={250}
            height={250}
            className="object-contain"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-3xl border border-[#FFE8B3]/20 p-8 shadow-lg">
            <div className="text-center mb-6">
              <span className="font-mono text-[#FFE8B3] text-xl tracking-wide">Weekly Spending</span>
            </div>

            <div className="relative flex items-end justify-between px-4 h-64 mb-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-1/4 border-t border-white/10" />
                <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
                <div className="absolute inset-x-0 top-3/4 border-t border-white/10" />
              </div>
              {weeklyData.map((week, idx) => {
                const barHeight = (week.amount / maxWeeklySpending) * 150;
                const moonPhase = idx / 3;

                return (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 rounded-t-xl shadow-[0_-2px_12px_rgba(255,232,179,0.25)]"
                      style={{
                        height: `${Math.max(barHeight, 10)}px`,
                        background:
                          "linear-gradient(180deg, rgba(255,232,179,1) 0%, rgba(255,232,179,0.65) 60%, rgba(255,232,179,0.35) 100%)",
                      }}
                    />
                    <div
                      className="w-14 h-14 rounded-full shadow-md"
                      style={{
                        background: `radial-gradient(circle at ${30 + moonPhase * 40}% 30%, #FFE8B3 40%, #36336A ${40 + moonPhase * 30}%)`,
                      }}
                    />
                    <div className="font-mono text-[#FFE8B3] text-sm opacity-80">{week.week}</div>
                    <div className="font-mono text-[#FFE8B3] text-base font-bold">{formatCurrency(week.amount)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#2A2850]/90 backdrop-blur-md rounded-3xl p-8 border border-[#FFE8B3]/10 shadow-lg">
            <div className="text-center mb-6">
              <span className="font-mono text-[#FFE8B3] text-xl tracking-wide">Category Breakdown</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="relative w-56 h-56 mx-auto flex-shrink-0">
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
                    <div className="font-mono text-[#FFE8B3] text-xs mb-1 opacity-80">Total Spend</div>
                    <div className="font-mono text-[#FFE8B3] text-2xl font-bold mt-1">{formatCurrency(data.totalSpent)}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="space-y-4">
                  {topCategories.map(([category, amount], idx) => {
                    const percentage = data.totalSpent > 0 ? Math.round((amount / data.totalSpent) * 100) : 0;
                    return (
                      <div key={category} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: starColors[idx] }}
                            aria-hidden
                          />
                          <span className="font-mono text-[#FFE8B3] text-sm">{category}</span>
                        </div>
                        <div className="flex items-baseline gap-3 pl-6">
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
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={() => setShowBunnyChat(true)}
            className="bg-[#3D3A6E]/70 backdrop-blur-md text-[#FFE8B3] relative top-4 font-mono px-8 py-4 rounded-full border-2 border-[#FFE8B3]/30 hover:bg-[#4D4A7E] hover:scale-105 transition-all text-base shadow-lg font-bold flex items-center gap-3"
          >
            <Image
              src="/images/bunny.svg"
              alt="Bunny"
              width={40}
              height={40}
              className="object-contain"
            />
            <span>Ask me about your spending</span>
          </button>
        </div>

        <div>
          <div className="font-mono text-[#FFE8B3] text-2xl mb-8 relative top-4 text-center">
            Based on your spendings.....
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-6 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-sm mb-4 leading-tight">
                Your spending rate is
              </div>
              <div className="font-mono text-[#FFE8B3] text-4xl font-bold mb-3">
                {formatCurrency(data.spendingRate, 2)}
              </div>
              <div className="font-mono text-[#FFE8B3] text-base opacity-70">per day</div>
            </div>

            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-6 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-sm mb-4 leading-tight">
                Your cash stability score is
              </div>
              <div className="font-mono text-[#FFE8B3] text-4xl font-bold mb-3">
                {data.cashStability}
              </div>
              <div className="font-mono text-[#FFE8B3] text-base opacity-70">
                based on spending consistency
              </div>
            </div>

            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-2xl p-6 text-center border border-[#FFE8B3]/20 shadow-md">
              <div className="font-mono text-[#FFE8B3] text-sm mb-4 leading-tight">
                You've spent
              </div>
              <div
                className={`font-mono text-4xl font-bold mb-3 ${
                  currentBudgetOverage > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatCurrency(Math.abs(currentBudgetOverage), 2)}
              </div>
              <div className="font-mono text-[#FFE8B3] text-base opacity-70">
                {currentBudgetOverage > 0 ? "over" : "under"} your budget
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2850]/90 backdrop-blur-md rounded-3xl p-8 border border-[#FFE8B3]/10 shadow-lg">
          <div className="text-center mb-8">
            <span className="font-mono text-[#FFE8B3] text-xl tracking-wide">AI Model Feature Importance</span>
            <p className="font-mono text-[#FFE8B3]/70 text-sm mt-2">SHAP-style analysis of factors affecting your credit health</p>
          </div>

          <div className="space-y-4">
            {(() => {
              const features = [
                {
                  name: 'Spending Consistency',
                  value: data.cashStability,
                  impact: data.cashStability >= 70 ? 15 : data.cashStability >= 40 ? 0 : -15,
                  description: 'Daily spending variance - lower variance is better'
                },
                {
                  name: 'Budget Adherence',
                  value: currentBudgetOverage <= 0 ? 100 : Math.max(0, 100 - (Math.abs(currentBudgetOverage) / budgetAmount) * 100),
                  impact: currentBudgetOverage <= 0 ? 12 : currentBudgetOverage <= budgetAmount * 0.1 ? -5 : -18,
                  description: 'How well you stay within budget limits'
                },
                {
                  name: 'Spending Velocity',
                  value: Math.min(100, (data.spendingRate / 100) * 100),
                  impact: data.spendingRate > 100 ? -10 : data.spendingRate > 50 ? -5 : 8,
                  description: 'Daily spending rate - lower is better for credit health'
                },
                {
                  name: 'Category Diversity',
                  value: Math.min(100, (Object.keys(data.categories).length / 8) * 100),
                  impact: Object.keys(data.categories).length >= 5 ? 8 : Object.keys(data.categories).length >= 3 ? 3 : -5,
                  description: 'Number of spending categories - diversity indicates healthy habits'
                },
                {
                  name: 'Total Spending Ratio',
                  value: Math.min(100, (data.totalSpent / (budgetAmount * 1.5)) * 100),
                  impact: data.totalSpent <= budgetAmount ? 10 : data.totalSpent <= budgetAmount * 1.2 ? 0 : -12,
                  description: 'Total spending relative to budget capacity'
                }
              ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

              return features.map((feature, idx) => {
                const absImpact = Math.abs(feature.impact);
                const maxImpact = 20;
                const barWidth = (absImpact / maxImpact) * 100;
                const isPositive = feature.impact > 0;

                return (
                  <div key={idx} className="bg-[#3D3A6E]/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-mono text-[#FFE8B3] text-sm font-bold">{idx + 1}.</span>
                        <span className="font-mono text-[#FFE8B3] text-base">{feature.name}</span>
                      </div>
                      <span className={`font-mono text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{feature.impact.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-6 bg-[#36336A] rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-[#FFE8B3]/20" />
                        <div
                          className={`h-full ${isPositive ? 'bg-green-400' : 'bg-red-400'} transition-all`}
                          style={{
                            width: `${barWidth}%`,
                            marginLeft: isPositive ? '50%' : `${50 - barWidth}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[#FFE8B3] text-xs w-16 text-right">
                        {feature.value.toFixed(0)}%
                      </span>
                    </div>

                    <p className="font-mono text-[#FFE8B3]/60 text-xs">
                      {feature.description}
                    </p>
                  </div>
                );
              });
            })()}
          </div>

          <div className="mt-8 p-6 bg-[#36336A]/50 rounded-2xl border border-[#FFE8B3]/10">
            <div className="font-mono text-[#FFE8B3] text-sm mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Understanding SHAP Values</span>
            </div>
            <p className="font-mono text-[#FFE8B3]/80 text-xs leading-relaxed mb-3">
              These values show how each factor pushes your credit risk score higher (+) or lower (-).
              Green bars indicate positive impacts (reducing risk), while red bars show negative impacts (increasing risk).
            </p>
            <p className="font-mono text-[#FFE8B3]/80 text-xs leading-relaxed">
              The ML model uses SHAP (SHapley Additive exPlanations) to explain predictions transparently.
              Focus on improving the factors with the largest negative impact first for the best results.
            </p>
          </div>
        </div>

        <div className="text-center relative">
          {showReward && (
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-50 animate-bounce">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-[#36336A] font-mono px-8 py-4 rounded-2xl shadow-2xl border-4 border-yellow-500">
                <div className="text-3xl font-bold mb-2">Congrats twin! 🎉</div>
                <div className="text-lg">You're under budget!</div>
              </div>
            </div>
          )}

          {isEditingBudget ? (
            <div className="bg-[#3D3A6E]/70 backdrop-blur-md rounded-3xl border border-[#FFE8B3]/20 p-10 shadow-lg">
              <div className="font-mono text-[#FFE8B3] text-2xl mb-8">Set Monthly Budget</div>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="font-mono text-[#FFE8B3] text-4xl">$</span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-2 border-[#FFE8B3]/30 rounded-xl px-8 py-5 font-mono text-[#FFE8B3] text-4xl w-64 text-center focus:outline-none focus:border-[#FFE8B3] transition-colors"
                  placeholder="2000"
                />
              </div>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={handleSaveBudget}
                  className="bg-[#FFE8B3] text-[#36336A] font-mono px-10 py-4 rounded-full hover:bg-[#FFE8B3]/90 transition-all hover:scale-105 shadow-md text-lg font-bold"
                >
                  Save Budget
                </button>
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="bg-transparent text-[#FFE8B3] font-mono px-10 py-4 rounded-full border-2 border-[#FFE8B3]/30 hover:bg-white/10 transition-all hover:scale-105 text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingBudget(true)}
              className="bg-[#3D3A6E]/70 backdrop-blur-md text-[#FFE8B3] font-mono px-14 py-6 rounded-full border-2 border-[#FFE8B3]/30 hover:bg-[#4D4A7E] transition-all hover:scale-105 text-xl shadow-lg font-bold"
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
                  src="/images/bunny.svg"
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
