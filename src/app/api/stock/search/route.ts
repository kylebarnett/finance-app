import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json(
      { success: false, error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const quotes = data.quotes || [];

    // Filter to only show stocks and ETFs (not crypto, futures, etc.)
    const filteredQuotes = quotes
      .filter((q: { quoteType: string; exchange: string }) =>
        ["EQUITY", "ETF"].includes(q.quoteType) &&
        !q.exchange?.includes("CCC") // Exclude crypto
      )
      .map((q: { symbol: string; shortname: string; longname: string; exchange: string; quoteType: string }) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname,
        exchange: q.exchange,
        type: q.quoteType,
      }));

    return NextResponse.json({
      success: true,
      data: filteredQuotes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search stocks",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
