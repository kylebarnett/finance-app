import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Map range to period and interval for yahoo-finance2
function getRangeConfig(range: string): { period1: Date; interval: "1m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1wk" | "1mo" } {
  const now = new Date();

  switch (range) {
    case "1d":
      return {
        period1: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        interval: "5m",
      };
    case "5d":
      return {
        period1: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        interval: "15m",
      };
    case "1mo":
      return {
        period1: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        interval: "1h",
      };
    case "3mo":
      return {
        period1: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        interval: "1d",
      };
    case "6mo":
      return {
        period1: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        interval: "1d",
      };
    case "1y":
      return {
        period1: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        interval: "1d",
      };
    default:
      return {
        period1: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        interval: "5m",
      };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") || "1d";

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    const { period1, interval } = getRangeConfig(range);

    const result = await yahooFinance.chart(symbol, {
      period1,
      interval,
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No data available for this symbol" },
        { status: 404 }
      );
    }

    // Format data for lightweight-charts
    const chartData = result.quotes
      .filter((q) => q.close !== null && q.close !== undefined)
      .map((q) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open ?? null,
        high: q.high ?? null,
        low: q.low ?? null,
        close: q.close ?? null,
        value: q.close ?? null,
        volume: q.volume ?? null,
      }));

    return NextResponse.json({
      success: true,
      symbol: result.meta?.symbol,
      currency: result.meta?.currency,
      exchangeName: result.meta?.exchangeName,
      data: chartData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chart data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
