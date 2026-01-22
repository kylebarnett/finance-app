"use client";

import { motion } from "framer-motion";

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

interface HoldingsListProps {
  holdings: Holding[];
  isLoading?: boolean;
  onSell?: (holding: Holding) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  }),
};

export default function HoldingsList({
  holdings,
  isLoading = false,
  onSell,
}: HoldingsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="animate-pulse flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--cream)] rounded-full"></div>
                <div>
                  <div className="h-5 bg-[var(--cream)] rounded w-32 mb-2"></div>
                  <div className="h-4 bg-[var(--cream)] rounded w-20"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-[var(--cream)] rounded w-24 mb-2"></div>
                <div className="h-4 bg-[var(--cream)] rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🌱
        </motion.div>
        <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
          No stocks yet!
        </h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          You don&apos;t own any stocks yet. Search for a company you like and buy your first shares to start building your portfolio!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {holdings.map((holding, index) => {
        const isPositive = holding.gainLoss >= 0;

        return (
          <motion.div
            key={holding.symbol}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01 }}
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-6 shadow-[var(--shadow-soft)] border border-transparent hover:border-[var(--cream-dark)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left side - Company info */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-[var(--cream)] rounded-2xl flex items-center justify-center text-3xl"
                >
                  {holding.emoji}
                </motion.div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    {holding.companyName}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {holding.symbol} &bull; {holding.quantity} share{holding.quantity !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Middle - Cost info */}
              <div className="flex items-center gap-8 md:gap-12">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Avg Cost</p>
                  <p className="font-semibold text-[var(--text-secondary)]">
                    {formatCurrency(holding.averageCost)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Current</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {formatCurrency(holding.currentPrice)}
                  </p>
                </div>
              </div>

              {/* Right side - Value and gain/loss */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(holding.currentValue)}
                  </p>
                  <p className={`text-sm font-semibold ${
                    isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"
                  }`}>
                    {isPositive ? "+" : ""}{formatCurrency(holding.gainLoss)} ({isPositive ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%)
                  </p>
                </div>

                {/* Sell button */}
                {onSell && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSell(holding)}
                    className="px-4 py-2 bg-[var(--coral)]/10 text-[var(--coral)] font-semibold rounded-xl hover:bg-[var(--coral)]/20 transition-colors"
                  >
                    Sell
                  </motion.button>
                )}
              </div>
            </div>

            {/* Gain/loss indicator bar */}
            <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg ${isPositive ? "" : ""}`}>
                  {isPositive ? "📈" : "📉"}
                </span>
                <div className="flex-1 h-2 bg-[var(--cream)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(holding.gainLossPercent) * 2, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      isPositive ? "bg-[var(--up-green)]" : "bg-[var(--down-red)]"
                    }`}
                  />
                </div>
                <span className="text-xs text-[var(--text-muted)] w-20 text-right">
                  {isPositive ? "+" : ""}{holding.gainLossPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
