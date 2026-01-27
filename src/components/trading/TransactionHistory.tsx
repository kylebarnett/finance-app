"use client";

import { motion } from "framer-motion";

interface Transaction {
  id: string;
  symbol: string;
  transactionType: "BUY" | "SELL";
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  executedAt: string;
  companyName: string;
  emoji: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  }),
};

export default function TransactionHistory({
  transactions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--cream)] rounded-xl"></div>
                <div>
                  <div className="h-4 bg-[var(--cream)] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[var(--cream)] rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-[var(--cream)] rounded w-20 mb-1"></div>
                <div className="h-3 bg-[var(--cream)] rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          📋
        </motion.div>
        <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
          No trades yet!
        </h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Your trading history will appear here once you buy or sell your first stock. Ready to make your first investment?
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const isBuy = tx.transactionType === "BUY";

        return (
          <motion.div
            key={tx.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              {/* Left - Type badge and company */}
              <div className="flex items-center gap-4">
                {/* Transaction type badge */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isBuy
                      ? "bg-[var(--teal-bg)] text-[var(--teal)]"
                      : "bg-[var(--coral)]/10 text-[var(--coral)]"
                  }`}
                >
                  {isBuy ? "BUY" : "SELL"}
                </div>

                {/* Company info */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tx.emoji}</span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {tx.companyName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {tx.symbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Amount and details */}
              <div className="text-right">
                <p className={`font-display text-lg font-bold ${
                  isBuy ? "text-[var(--text-primary)]" : "text-[var(--up-green)]"
                }`}>
                  {isBuy ? "-" : "+"}{formatCurrency(tx.totalAmount)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {tx.quantity} share{tx.quantity !== 1 ? "s" : ""} @ {formatCurrency(tx.pricePerShare)}
                </p>
              </div>
            </div>

            {/* Date/time footer */}
            <div className="mt-3 pt-3 border-t border-[var(--cream-dark)] flex items-center gap-2">
              <span className="text-sm">🗓️</span>
              <span className="text-xs text-[var(--text-muted)]">
                {formatDate(tx.executedAt)} at {formatTime(tx.executedAt)}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="w-full py-4 bg-[var(--cream)] hover:bg-[var(--cream-dark)] rounded-xl font-semibold text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
              Loading...
            </span>
          ) : (
            "Load more trades"
          )}
        </motion.button>
      )}
    </div>
  );
}
