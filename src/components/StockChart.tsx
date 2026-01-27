"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, AreaSeries, AreaData, Time } from "lightweight-charts";
import { useTheme } from "@/components/ThemeProvider";

interface ChartDataPoint {
  time: number;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface StockChartProps {
  symbol: string;
  range?: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y";
  height?: number;
  showControls?: boolean;
  isPositive?: boolean;
  compact?: boolean;
}

const rangeToInterval: Record<string, string> = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1h",
  "3mo": "1d",
  "6mo": "1d",
  "1y": "1d",
};

export default function StockChart({
  symbol,
  range: initialRange = "1d",
  height = 300,
  showControls = true,
  isPositive = true,
  compact = false,
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [range, setRange] = useState(initialRange);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Theme-aware colors
    const lineColor = isPositive
      ? (isDark ? "#7BD88A" : "#6BCB77")
      : (isDark ? "#FF9595" : "#FF8787");
    const areaTopColor = isPositive
      ? (isDark ? "rgba(123, 216, 138, 0.3)" : "rgba(107, 203, 119, 0.4)")
      : (isDark ? "rgba(255, 149, 149, 0.3)" : "rgba(255, 135, 135, 0.4)");
    const areaBottomColor = isPositive
      ? "rgba(107, 203, 119, 0.0)"
      : "rgba(255, 135, 135, 0.0)";
    const textColor = isDark ? "#B0B0B8" : "#636E72";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(245, 237, 227, 0.5)";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: textColor,
        fontFamily: "'DM Sans', sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: compact ? 120 : height,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: range === "1d" || range === "5d",
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          labelVisible: false,
        },
      },
      handleScale: !compact,
      handleScroll: !compact,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: !compact,
      crosshairMarkerVisible: !compact,
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [isPositive, height, compact, range, isDark]);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const interval = rangeToInterval[range];
        const response = await fetch(
          `/api/market/chart?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const result = await response.json();

        if (!result.success || !result.data?.length) {
          throw new Error("No chart data available");
        }

        const chartData: AreaData<Time>[] = result.data.map((d: ChartDataPoint) => ({
          time: d.time as Time,
          value: d.value || d.close,
        }));

        if (seriesRef.current) {
          seriesRef.current.setData(chartData);
          chartRef.current?.timeScale().fitContent();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();

    // Refresh data periodically for intraday charts
    let refreshInterval: NodeJS.Timeout | null = null;
    if (range === "1d" || range === "5d") {
      refreshInterval = setInterval(fetchChartData, 60000); // Refresh every minute
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [symbol, range]);

  const ranges = [
    { value: "1d", label: "1D" },
    { value: "5d", label: "5D" },
    { value: "1mo", label: "1M" },
    { value: "3mo", label: "3M" },
    { value: "6mo", label: "6M" },
    { value: "1y", label: "1Y" },
  ];

  return (
    <div className="relative">
      {showControls && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value as typeof range)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-all
                  ${range === r.value
                    ? "bg-[var(--coral)] text-white"
                    : "bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)]"
                  }
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={chartContainerRef}
        className={`relative rounded-xl overflow-hidden ${compact ? "" : "bg-[var(--card-bg)]"}`}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Loading chart...</span>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)] rounded-xl">
          <div className="text-center text-[var(--text-muted)] text-sm">
            <span className="block text-2xl mb-2">📊</span>
            <span>Chart unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
}
