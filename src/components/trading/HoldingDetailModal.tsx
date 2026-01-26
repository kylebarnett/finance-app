"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StockChart from "@/components/StockChart";
import StockNewsPreview from "@/components/news/StockNewsPreview";

interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  companyName: string;
  emoji: string;
}

interface HoldingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: Holding;
  onSell: () => void;
  onBuyMore: () => void;
}

interface StockData {
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  exchange: string;
  currency: string;
  emoji: string;
  description: string;
  funFact: string;
}

function formatCurrency(num: number): string {
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLargeNumber(num: number): string {
  if (!num || isNaN(num)) return "N/A";
  if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(2)}T`;
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  return `$${num.toLocaleString()}`;
}

function formatVolume(num: number): string {
  if (!num) return "N/A";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function HoldingDetailModal({
  isOpen,
  onClose,
  holding,
  onSell,
  onBuyMore,
}: HoldingDetailModalProps) {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && holding.symbol) {
      setIsLoading(true);
      setError(null);

      fetch(`/api/stock?symbol=${encodeURIComponent(holding.symbol)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            setStockData(result.data);
          } else {
            setError("Couldn't load stock data");
          }
        })
        .catch(() => {
          setError("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, holding.symbol]);

  const isUp = stockData ? stockData.change >= 0 : true;
  const isPositive = holding.gainLoss >= 0;
  const totalInvested = holding.quantity * holding.averageCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-[24px] shadow-2xl z-50 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--cream)] hover:bg-[var(--cream-dark)] transition-colors z-10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 5l10 10M15 5l-10 10" />
              </svg>
            </button>

            <div className="overflow-y-auto max-h-[90vh] p-6">
              {/* Header with holding info */}
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-[var(--cream)] rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
                >
                  {holding.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] truncate">
                    {holding.companyName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-[var(--cream-dark)] rounded-full text-sm font-semibold text-[var(--text-secondary)]">
                      {holding.symbol}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {holding.quantity} share{holding.quantity !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Position Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-5 rounded-[20px] mb-6 ${
                  isPositive
                    ? "bg-gradient-to-br from-[var(--up-green-bg)] to-white"
                    : "bg-gradient-to-br from-[var(--down-red-bg)] to-white"
                }`}
              >
                <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span>💼</span> Your Position
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Current Value</p>
                    <p className="font-display text-2xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(holding.currentValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Total Gain/Loss</p>
                    <p
                      className={`font-display text-2xl font-bold ${
                        isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(holding.gainLoss)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Total Invested</p>
                    <p className="font-semibold text-[var(--text-secondary)]">
                      {formatCurrency(totalInvested)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Return</p>
                    <p
                      className={`font-semibold ${
                        isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">Performance</span>
                    <span
                      className={`font-semibold ${
                        isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
                      }`}
                    >
                      {isPositive ? "📈" : "📉"} {isPositive ? "+" : ""}
                      {holding.gainLossPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(Math.abs(holding.gainLossPercent) * 2, 100)}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        isPositive ? "bg-[var(--up-green)]" : "bg-[var(--down-red)]"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Cost Basis Info */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[var(--cream)]/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Shares Owned</p>
                  <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                    {holding.quantity}
                  </p>
                </div>
                <div className="bg-[var(--cream)]/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Avg Cost</p>
                  <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                    {formatCurrency(holding.averageCost)}
                  </p>
                </div>
                <div className="bg-[var(--cream)]/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Current Price</p>
                  <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                    {formatCurrency(holding.currentPrice)}
                  </p>
                </div>
              </div>

              {/* Loading state for stock data */}
              {isLoading && (
                <div className="py-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-3xl inline-block mb-3"
                  >
                    ⏳
                  </motion.div>
                  <p className="text-[var(--text-secondary)]">Loading stock details...</p>
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-3">😕</div>
                  <p className="text-[var(--text-secondary)]">{error}</p>
                </div>
              )}

              {/* Stock data */}
              {stockData && !isLoading && !error && (
                <>
                  {/* Today's Price Change */}
                  <div className="mb-6">
                    <h4 className="font-display font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <span>📊</span> Today&apos;s Performance
                    </h4>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        isUp
                          ? "bg-[var(--up-green-bg)] text-[var(--up-green)]"
                          : "bg-[var(--down-red-bg)] text-[var(--down-red)]"
                      }`}
                    >
                      <span className="text-lg">{isUp ? "📈" : "📉"}</span>
                      <span>
                        {isUp ? "+" : ""}
                        {formatCurrency(stockData.change)} ({isUp ? "+" : ""}
                        {stockData.changePercent?.toFixed(2)}%) today
                      </span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-[var(--cream)]/30 rounded-xl p-4 mb-6">
                    <StockChart
                      symbol={stockData.symbol}
                      range="1mo"
                      height={180}
                      showControls={true}
                      isPositive={isUp}
                    />
                  </div>

                  {/* Description */}
                  {stockData.description && (
                    <div className="mb-6">
                      <h4 className="font-display font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                        <span>🏢</span> About {stockData.name}
                      </h4>
                      <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                        {stockData.description}
                      </p>
                    </div>
                  )}

                  {/* Fun Fact */}
                  {stockData.funFact && (
                    <div className="p-4 bg-[var(--sunny-light)]/30 rounded-xl flex items-start gap-3 mb-6">
                      <span className="text-2xl">💡</span>
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Fun Fact:{" "}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {stockData.funFact}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* News Preview */}
                  <StockNewsPreview
                    symbol={stockData.symbol}
                    companyName={stockData.name}
                    limit={3}
                  />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Market Cap</p>
                      <p className="font-display font-bold text-[var(--text-primary)]">
                        {formatLargeNumber(stockData.marketCap)}
                      </p>
                    </div>
                    <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Volume</p>
                      <p className="font-display font-bold text-[var(--text-primary)]">
                        {formatVolume(stockData.volume)}
                      </p>
                    </div>
                    <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Day Range</p>
                      <p className="font-display font-bold text-[var(--text-primary)] text-sm">
                        {formatCurrency(stockData.dayLow)} - {formatCurrency(stockData.dayHigh)}
                      </p>
                    </div>
                    <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">52-Week Range</p>
                      <p className="font-display font-bold text-[var(--text-primary)] text-sm">
                        {formatCurrency(stockData.fiftyTwoWeekLow)} -{" "}
                        {formatCurrency(stockData.fiftyTwoWeekHigh)}
                      </p>
                    </div>
                    <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Previous Close</p>
                      <p className="font-display font-bold text-[var(--text-primary)]">
                        {formatCurrency(stockData.previousClose)}
                      </p>
                    </div>
                    {stockData.peRatio && (
                      <div className="bg-[var(--cream)]/50 rounded-xl p-3">
                        <p className="text-xs text-[var(--text-muted)] mb-1">P/E Ratio</p>
                        <p className="font-display font-bold text-[var(--text-primary)]">
                          {stockData.peRatio.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBuyMore}
                  className="flex-1 py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Buy More 🛒
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSell}
                  className="flex-1 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Sell 💰
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
