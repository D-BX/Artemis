import { NextRequest, NextResponse } from "next/server";

interface SpendingData {
  transactions: any[];
  totalSpent: number;
  categories: { [key: string]: number };
  weeklySpending: { week: string; amount: number }[];
  spendingRate: number;
  cashStability: number;
  budgetOverage: number;
}

export async function POST(request: NextRequest) {
  try {
    const { message, spendingData } = await request.json();

    if (!message || !spendingData) {
      return NextResponse.json(
        { error: "Message and spending data are required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        spending_data: spendingData,
      }),
    });

    if (!response.ok) {
      console.warn("Backend API unavailable, using fallback response");

      const fallbackResponse = generateFallbackResponse(message, spendingData);
      return NextResponse.json({ response: fallbackResponse });
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error("Error getting chat insights:", error);

    const { spendingData } = await request.json();
    const fallbackResponse = generateFallbackResponse(
      await request.json().then((data) => data.message),
      spendingData
    );
    return NextResponse.json({ response: fallbackResponse });
  }
}

function generateFallbackResponse(message: string, spendingData: SpendingData): string {
  const messageLower = message.toLowerCase();

  if (messageLower.includes("budget") || messageLower.includes("overage")) {
    if (spendingData.budgetOverage > 0) {
      return `You're currently ${spendingData.budgetOverage}% over budget. Your total spending is $${spendingData.totalSpent.toFixed(2)}. Consider reducing spending in your highest categories to get back on track.`;
    } else {
      return `Great job! You're under budget by ${Math.abs(spendingData.budgetOverage)}%. Keep up the good spending habits!`;
    }
  }

  if (messageLower.includes("category") || messageLower.includes("categories")) {
    const topCategory = Object.entries(spendingData.categories).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];
    return `Your highest spending category is ${topCategory[0]} at $${(topCategory[1] as number).toFixed(2)}. This represents ${((topCategory[1] as number / spendingData.totalSpent) * 100).toFixed(1)}% of your total spending.`;
  }

  if (messageLower.includes("stability") || messageLower.includes("consistent")) {
    return `Your cash stability score is ${spendingData.cashStability}/100. ${
      spendingData.cashStability >= 70
        ? "This indicates consistent spending patterns, which is good for budgeting!"
        : "Your spending varies week to week. Try to maintain more consistent spending habits."
    }`;
  }

  if (messageLower.includes("weekly") || messageLower.includes("week")) {
    const avgWeekly = spendingData.weeklySpending.reduce((sum, w) => sum + w.amount, 0) / spendingData.weeklySpending.length;
    return `Your average weekly spending is $${avgWeekly.toFixed(2)}. Your weekly spending rate is $${spendingData.spendingRate.toFixed(2)}/week.`;
  }

  return `Based on your spending data: You've spent $${spendingData.totalSpent.toFixed(2)} total, with an average of $${spendingData.spendingRate.toFixed(2)}/week. Your cash stability score is ${spendingData.cashStability}/100. ${
    spendingData.budgetOverage > 0
      ? `You're ${spendingData.budgetOverage}% over budget - consider reducing spending.`
      : `You're ${Math.abs(spendingData.budgetOverage)}% under budget - great job!`
  }`;
}
