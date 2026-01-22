import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Transaction, PaperAccount } from "@/lib/types/database";

// Company emojis for display
const companyEmojis: Record<string, string> = {
  AAPL: "🍎",
  GOOGL: "🔍",
  GOOG: "🔍",
  MSFT: "🪟",
  AMZN: "📦",
  TSLA: "🚗",
  META: "👥",
  NVDA: "🎮",
  DIS: "🏰",
  NKE: "👟",
  MCD: "🍔",
  NFLX: "🎬",
  SBUX: "☕",
  COST: "🛒",
  WMT: "🏪",
  JPM: "🏦",
  V: "💳",
  MA: "💳",
};

// Company names lookup
const companyNames: Record<string, string> = {
  AAPL: "Apple",
  GOOGL: "Alphabet (Google)",
  GOOG: "Alphabet (Google)",
  MSFT: "Microsoft",
  AMZN: "Amazon",
  TSLA: "Tesla",
  META: "Meta (Facebook)",
  NVDA: "NVIDIA",
  DIS: "Disney",
  NKE: "Nike",
  MCD: "McDonald's",
  NFLX: "Netflix",
  SBUX: "Starbucks",
  COST: "Costco",
  WMT: "Walmart",
  JPM: "JPMorgan Chase",
  V: "Visa",
  MA: "Mastercard",
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to view your history" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const symbolFilter = searchParams.get("symbol")?.toUpperCase();

    // Get user's paper account
    const { data: paperAccount, error: accountError } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (accountError || !paperAccount) {
      return NextResponse.json(
        { success: false, error: "Paper account not found" },
        { status: 404 }
      );
    }

    const account = paperAccount as PaperAccount;

    // Build query for transactions
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("paper_account_id", account.id)
      .order("executed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply symbol filter if provided
    if (symbolFilter) {
      query = query.eq("symbol", symbolFilter);
    }

    const { data: transactionsData, error: transactionsError, count } = await query;

    if (transactionsError) {
      console.error("Transactions fetch error:", transactionsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch transaction history" },
        { status: 500 }
      );
    }

    const transactions = (transactionsData || []) as Transaction[];

    // Enrich transactions with company info
    const enrichedTransactions = transactions.map(tx => ({
      id: tx.id,
      symbol: tx.symbol,
      transactionType: tx.transaction_type,
      quantity: tx.quantity,
      pricePerShare: tx.price_per_share,
      totalAmount: tx.total_amount,
      executedAt: tx.executed_at,
      companyName: companyNames[tx.symbol] || tx.symbol,
      emoji: companyEmojis[tx.symbol] || "🏢",
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: enrichedTransactions,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transaction history",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
