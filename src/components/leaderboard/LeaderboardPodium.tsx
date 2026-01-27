"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types/database";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
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

const trophyEmojis = ["🥇", "🥈", "🥉"];
const confettiEmojis = ["🎉", "⭐", "✨", "🌟", "💫"];

export default function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  // Get top 3 (may be less if not enough participants)
  const topThree = entries.slice(0, 3);

  if (topThree.length === 0) {
    return null;
  }

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree[1] || null, // 2nd place (left)
    topThree[0] || null, // 1st place (center, tallest)
    topThree[2] || null, // 3rd place (right)
  ];

  const podiumHeights = ["h-28", "h-36", "h-24"];
  const delays = [0.2, 0, 0.4];

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Top Investors 🏆
        </h2>
        <p className="text-[var(--text-secondary)]">
          The best paper traders this week!
        </p>
      </motion.div>

      <div className="flex items-end justify-center gap-3 md:gap-6">
        {podiumOrder.map((entry, index) => {
          if (!entry) return <div key={index} className="w-28 md:w-36" />;

          const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
          const isPositive = entry.gain_loss_percent >= 0;

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delays[index], type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Winner info card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-[var(--shadow-soft)] mb-2 w-28 md:w-36"
              >
                {/* Trophy and Avatar */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-2xl md:text-3xl">{trophyEmojis[actualRank - 1]}</span>
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="text-2xl md:text-3xl"
                  >
                    {entry.avatar_emoji}
                  </motion.span>
                </div>

                {/* Name */}
                <p className="font-display font-bold text-[var(--text-primary)] text-sm md:text-base truncate text-center">
                  {entry.display_name}
                </p>

                {/* Total Value */}
                <p className="font-display text-lg md:text-xl font-bold text-[var(--text-primary)] text-center">
                  {formatCurrency(entry.total_value)}
                </p>

                {/* Gain/Loss */}
                <p className={`text-xs md:text-sm font-semibold text-center ${isPositive ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
                  {formatPercent(entry.gain_loss_percent)}
                </p>
              </motion.div>

              {/* Podium block */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: delays[index] + 0.3, type: "spring" }}
                className={`${podiumHeights[index]} w-28 md:w-36 rounded-t-xl flex items-center justify-center origin-bottom ${
                  actualRank === 1
                    ? "bg-gradient-to-b from-yellow-300 to-yellow-500"
                    : actualRank === 2
                    ? "bg-gradient-to-b from-gray-200 to-gray-400"
                    : "bg-gradient-to-b from-amber-500 to-amber-700"
                }`}
              >
                <span className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                  {actualRank}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Confetti effect for 1st place */}
      {topThree.length > 0 && (
        <div className="relative">
          {confettiEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -60],
                x: [0, (i - 2) * 30],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              className="absolute left-1/2 -top-16 text-2xl pointer-events-none"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
