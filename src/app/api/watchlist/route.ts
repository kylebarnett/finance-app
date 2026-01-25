import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
import type { WatchlistItem } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

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

// GET - Fetch user's watchlist with live prices
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to view your watchlist" },
        { status: 401 }
      );
    }

    // Get watchlist items
    const { data: watchlistData, error: watchlistError } = await supabase
      .from("watchlist_items")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (watchlistError) {
      console.error("Watchlist fetch error:", watchlistError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch watchlist" },
        { status: 500 }
      );
    }

    const watchlist = (watchlistData || []) as WatchlistItem[];

    // If no items, return empty array
    if (watchlist.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch live prices for all symbols
    const symbols = watchlist.map(item => item.symbol);
    let quotes: Record<string, { price: number; change: number; changePercent: number; name: string }> = {};

    try {
      const quoteResults = await yahooFinance.quote(symbols);
      const quotesArray = Array.isArray(quoteResults) ? quoteResults : [quoteResults];

      for (const quote of quotesArray) {
        if (quote && quote.symbol) {
          quotes[quote.symbol] = {
            price: quote.regularMarketPrice ?? 0,
            change: quote.regularMarketChange ?? 0,
            changePercent: quote.regularMarketChangePercent ?? 0,
            name: quote.shortName || quote.longName || quote.symbol,
          };
        }
      }
    } catch (error) {
      console.error("Failed to fetch live prices:", error);
      // Continue with zeros if quotes fail
    }

    // Enrich watchlist with live data
    const enrichedWatchlist = watchlist.map(item => {
      const quote = quotes[item.symbol] || { price: 0, change: 0, changePercent: 0, name: item.symbol };
      return {
        ...item,
        company_name: item.company_name || quote.name,
        current_price: quote.price,
        change: quote.change,
        change_percent: quote.changePercent,
        emoji: companyEmojis[item.symbol] || "🏢",
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedWatchlist,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You need to be logged in to add to your watchlist" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { symbol, company_name, notes } = body;

    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a stock symbol" },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // Check if already in watchlist
    const { data: existing } = await supabase
      .from("watchlist_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("symbol", upperSymbol)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This stock is already on your watchlist!" },
        { status: 400 }
      );
    }

    // Check watchlist limit (max 20 items)
    const { count } = await supabase
      .from("watchlist_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count >= 20) {
      return NextResponse.json(
        { success: false, error: "Your watchlist is full! Remove some stocks to add more." },
        { status: 400 }
      );
    }

    // Add to watchlist
    const { data: newItem, error: insertError } = await supabase
      .from("watchlist_items")
      .insert({
        user_id: user.id,
        symbol: upperSymbol,
        company_name: company_name || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Watchlist insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to add to watchlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newItem,
        emoji: companyEmojis[upperSymbol] || "🏢",
      },
      message: `${company_name || upperSymbol} added to your watchlist!`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
