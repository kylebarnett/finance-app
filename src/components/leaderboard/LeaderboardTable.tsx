"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types/database";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(percent: number): string {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return "⭐";
  return "📈";
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  // Skip first 3 if we're showing the podium separately
  const tableEntries = entries.slice(3);

  if (tableEntries.length === 0 && entries.length <= 3) {
    return null; // Podium handles everything
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-[24px] shadow-[var(--shadow-soft)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--cream)] px-4 py-3 border-b border-[var(--cream-dark)]">
        <div className="flex items-center">
          <div className="w-16 text-center font-display font-semibold text-[var(--text-secondary)] text-sm">
            Rank
          </div>
          <div className="flex-1 font-display font-semibold text-[var(--text-secondary)] text-sm">
            Investor
          </div>
          <div className="w-28 text-right font-display font-semibold text-[var(--text-secondary)] text-sm">
            Portfolio
          </div>
          <div className="w-24 text-right font-display font-semibold text-[var(--text-secondary)] text-sm hidden sm:block">
            Gain/Loss
          </div>
          <div className="w-20 text-right font-display font-semibold text-[var(--text-secondary)] text-sm hidden md:block">
            Trades
          </div>
        </div>
      </div>

      {/* Table body - show ranks 4+ */}
      <div className="divide-y divide-[var(--cream)]">
        {tableEntries.map((entry, index) => {
          const isCurrentUser = entry.user_id === currentUserId;
          const isPositive = entry.gain_loss_percent >= 0;

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`px-4 py-3 flex items-center hover:bg-[var(--cream)]/50 transition-colors ${
                isCurrentUser ? "bg-[var(--teal)]/10 border-l-4 border-[var(--teal)]" : ""
              }`}
            >
              {/* Rank */}
              <div className="w-16 text-center">
                <span className="text-lg mr-1">{getRankEmoji(entry.rank)}</span>
                <span className="font-display font-bold text-[var(--text-primary)]">
                  {entry.rank}
                </span>
              </div>

              {/* Investor info */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-xl">{entry.avatar_emoji}</span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-[var(--text-primary)] truncate">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-[var(--teal)] text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Portfolio value */}
              <div className="w-28 text-right">
                <p className="font-display font-bold text-[var(--text-primary)]">
                  {formatCurrency(entry.total_value)}
                </p>
              </div>

              {/* Gain/Loss */}
              <div className="w-24 text-right hidden sm:block">
                <p className={`font-semibold ${isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
                  {formatPercent(entry.gain_loss_percent)}
                </p>
              </div>

              {/* Trades */}
              <div className="w-20 text-right hidden md:block">
                <p className="text-[var(--text-secondary)]">
                  {entry.trade_count} {entry.trade_count === 1 ? "trade" : "trades"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more prompt */}
      {tableEntries.length >= 10 && (
        <div className="px-4 py-4 text-center bg-[var(--cream)]/30">
          <p className="text-[var(--text-muted)] text-sm">
            Showing top {entries.length} investors
          </p>
        </div>
      )}
    </div>
  );
}
