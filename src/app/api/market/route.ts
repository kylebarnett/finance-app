import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const INDICES = [
  { symbol: "^DJI", name: "DOW", fullName: "Dow Jones Industrial Average" },
  { symbol: "^GSPC", name: "S&P 500", fullName: "Standard & Poor's 500" },
  { symbol: "^IXIC", name: "NASDAQ", fullName: "NASDAQ Composite" },
];

export async function GET() {
  try {
    const symbols = INDICES.map((i) => i.symbol);

    const quotes = await yahooFinance.quote(symbols);

    const marketData = INDICES.map((index) => {
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
      const quote = quotesArray.find((q) => q?.symbol === index.symbol);

      if (!quote) {
        return {
          symbol: index.symbol,
          name: index.name,
          fullName: index.fullName,
          price: 0,
          change: 0,
          changePercent: 0,
          previousClose: 0,
          open: 0,
          dayHigh: 0,
          dayLow: 0,
          volume: 0,
          error: true,
        };
      }

      return {
        symbol: index.symbol,
        name: index.name,
        fullName: index.fullName,
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        changePercent: quote.regularMarketChangePercent ?? 0,
        previousClose: quote.regularMarketPreviousClose ?? 0,
        open: quote.regularMarketOpen ?? 0,
        dayHigh: quote.regularMarketDayHigh ?? 0,
        dayLow: quote.regularMarketDayLow ?? 0,
        volume: quote.regularMarketVolume ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Market data fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
