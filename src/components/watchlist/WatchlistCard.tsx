"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WatchlistCardProps {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  emoji: string;
  onBuy: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function WatchlistCard({
  symbol,
  companyName,
  currentPrice,
  change,
  changePercent,
  emoji,
  onBuy,
  onRemove,
  onViewDetails,
}: WatchlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const isPositive = change >= 0;

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    onRemove();
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuy();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      whileHover={{ scale: 1.02 }}
      onClick={onViewDetails}
      className="bg-white/70 backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)] border border-transparent hover:border-[var(--cream-dark)] transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left - Company info */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 bg-[var(--cream)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          >
            {emoji}
          </motion.div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-[var(--text-primary)] truncate">
              {companyName}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[var(--text-muted)]">{symbol}</p>
              <span className="text-xs text-[var(--teal)]">Tap for details</span>
            </div>
          </div>
        </div>

        {/* Center - Price info */}
        <div className="text-right flex-shrink-0">
          <p className="font-display text-lg font-bold text-[var(--text-primary)]">
            {formatCurrency(currentPrice)}
          </p>
          <p className={`text-sm font-semibold ${isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
            {isPositive ? "+" : ""}{formatCurrency(change)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
          </p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuy}
            className="px-4 py-2 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-shadow"
          >
            Buy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--cream)] text-[var(--text-muted)] hover:bg-[var(--down-red-bg)] hover:text-[var(--down-red)] transition-colors disabled:opacity-50"
            title="Remove from watchlist"
          >
            {isRemoving ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
