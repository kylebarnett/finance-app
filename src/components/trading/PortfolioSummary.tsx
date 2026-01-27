"use client";

import { motion } from "framer-motion";

interface PortfolioSummaryProps {
  totalValue: number;
  cashBalance: number;
  holdingsValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  startingBalance: number;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMoodEmoji(gainLossPercent: number): { emoji: string; label: string } {
  if (gainLossPercent > 10) return { emoji: "🚀", label: "Amazing!" };
  if (gainLossPercent > 5) return { emoji: "🎉", label: "Awesome!" };
  if (gainLossPercent > 2) return { emoji: "😄", label: "Great job!" };
  if (gainLossPercent > 0) return { emoji: "🙂", label: "Nice!" };
  if (gainLossPercent === 0) return { emoji: "😊", label: "Just starting!" };
  if (gainLossPercent > -2) return { emoji: "😐", label: "Hang in there!" };
  if (gainLossPercent > -5) return { emoji: "😕", label: "Markets are tough!" };
  return { emoji: "💪", label: "Stay strong!" };
}

export default function PortfolioSummary({
  totalValue,
  cashBalance,
  holdingsValue,
  totalGainLoss,
  totalGainLossPercent,
  startingBalance,
  isLoading = false,
}: PortfolioSummaryProps) {
  const isPositive = totalGainLoss >= 0;
  const mood = getMoodEmoji(totalGainLossPercent);
  const progressPercent = Math.min(Math.max((totalValue / startingBalance) * 100, 0), 200);

  if (isLoading) {
    return (
      <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)] mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--cream)] rounded-xl w-48 mb-4"></div>
          <div className="h-12 bg-[var(--cream)] rounded-xl w-64 mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-[var(--cream)] rounded-xl"></div>
            <div className="h-24 bg-[var(--cream)] rounded-xl"></div>
            <div className="h-24 bg-[var(--cream)] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)] mb-8"
    >
      {/* Header with mood */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-muted)]">Total Portfolio Value</span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >
            {mood.emoji}
          </motion.span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">{mood.label}</span>
        </motion.div>
      </div>

      {/* Main value */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <span className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
          {formatCurrency(totalValue)}
        </span>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`ml-3 text-lg font-semibold ${
            isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
          }`}
        >
          {isPositive ? "+" : ""}{formatCurrency(totalGainLoss)} ({isPositive ? "+" : ""}{totalGainLossPercent.toFixed(2)}%)
        </motion.span>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Cash */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--cream)]/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💵</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">Cash Available</span>
          </div>
          <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {formatCurrency(cashBalance)}
          </span>
        </motion.div>

        {/* Invested */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--cream)]/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">Invested in Stocks</span>
          </div>
          <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {formatCurrency(holdingsValue)}
          </span>
        </motion.div>

        {/* Gain/Loss */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-4 ${
            isPositive ? "bg-[var(--up-green-bg)]" : "bg-[var(--down-red-bg)]"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{isPositive ? "📈" : "📉"}</span>
            <span className={`text-sm font-medium ${
              isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
            }`}>
              {isPositive ? "Total Profit" : "Total Loss"}
            </span>
          </div>
          <span className={`font-display text-2xl font-bold ${
            isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
          }`}>
            {isPositive ? "+" : ""}{formatCurrency(totalGainLoss)}
          </span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Started with {formatCurrency(startingBalance)}</span>
          <span>{progressPercent.toFixed(0)}% of starting</span>
        </div>
        <div className="h-3 bg-[var(--cream)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className={`h-full rounded-full ${
              isPositive
                ? "bg-gradient-to-r from-[var(--teal)] to-[var(--up-green)]"
                : "bg-gradient-to-r from-[var(--coral)] to-[var(--down-red)]"
            }`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
