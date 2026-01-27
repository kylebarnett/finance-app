"use client";

import { motion } from "framer-motion";

interface ProfileStatsProps {
  tradeCount: number;
  achievementCount: number;
  watchlistCount: number;
  groupCount: number;
  daysSinceJoined: number;
}

export default function ProfileStats({
  tradeCount,
  achievementCount,
  watchlistCount,
  groupCount,
  daysSinceJoined,
}: ProfileStatsProps) {
  const stats = [
    { label: "Trades", value: tradeCount, emoji: "📊", color: "from-[var(--coral)] to-[var(--coral-dark)]" },
    { label: "Badges", value: achievementCount, emoji: "🏆", color: "from-[var(--sunny)] to-[var(--sunny-dark)]" },
    { label: "Watching", value: watchlistCount, emoji: "👀", color: "from-[var(--teal)] to-[var(--teal-dark)]" },
    { label: "Groups", value: groupCount, emoji: "👥", color: "from-[var(--purple)] to-[var(--purple-dark)]" },
    { label: "Days", value: daysSinceJoined, emoji: "📅", color: "from-[var(--up-green)] to-green-600" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[var(--card-bg-solid)] rounded-[20px] p-4 shadow-[var(--shadow-soft)] text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}
          >
            {stat.emoji}
          </motion.div>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {stat.value}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
