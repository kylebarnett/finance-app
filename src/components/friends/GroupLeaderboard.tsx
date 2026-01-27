"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types/database";

interface GroupLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  groupEmoji?: string;
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

function getRankDisplay(rank: number): { emoji: string; color: string } {
  if (rank === 1) return { emoji: "🥇", color: "from-yellow-300 to-yellow-500" };
  if (rank === 2) return { emoji: "🥈", color: "from-gray-200 to-gray-400" };
  if (rank === 3) return { emoji: "🥉", color: "from-amber-500 to-amber-700" };
  return { emoji: "📈", color: "from-[var(--cream)] to-[var(--cream-dark)]" };
}

export default function GroupLeaderboard({ entries, currentUserId }: GroupLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)] text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          📊
        </motion.div>
        <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2">
          No rankings yet!
        </h3>
        <p className="text-[var(--text-secondary)] text-sm">
          Start trading to see how everyone compares!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentUser = entry.user_id === currentUserId;
        const isPositive = entry.gain_loss_percent >= 0;
        const rankDisplay = getRankDisplay(entry.rank);

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            className={`bg-[var(--card-bg)] backdrop-blur-sm rounded-[16px] p-4 shadow-[var(--shadow-soft)] ${
              isCurrentUser ? "ring-2 ring-[var(--teal)] ring-offset-2" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rankDisplay.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-2xl">{rankDisplay.emoji}</span>
              </div>

              {/* Avatar and name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{entry.avatar_emoji}</span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-[var(--text-primary)] truncate">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-[var(--teal)] text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {entry.trade_count} {entry.trade_count === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Portfolio value */}
              <div className="text-right flex-shrink-0">
                <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {formatCurrency(entry.total_value)}
                </p>
                <p className={`text-sm font-semibold ${isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
                  {formatPercent(entry.gain_loss_percent)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
