"use client";

import { motion } from "framer-motion";
import type { AchievementWithStatus } from "@/lib/types/database";

interface AchievementBadgeProps {
  achievement: AchievementWithStatus;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const tierColors = {
  bronze: {
    bg: "bg-gradient-to-br from-amber-600 to-amber-800",
    border: "border-amber-500",
    glow: "shadow-amber-500/30",
    text: "text-amber-100",
  },
  silver: {
    bg: "bg-gradient-to-br from-slate-300 to-slate-500",
    border: "border-slate-300",
    glow: "shadow-slate-400/30",
    text: "text-slate-100",
  },
  gold: {
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    border: "border-yellow-300",
    glow: "shadow-yellow-400/40",
    text: "text-yellow-100",
  },
  platinum: {
    bg: "bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-400",
    border: "border-purple-300",
    glow: "shadow-purple-400/40",
    text: "text-white",
  },
};

const sizeClasses = {
  sm: {
    badge: "w-14 h-14",
    emoji: "text-xl",
    name: "text-xs",
    container: "w-20",
  },
  md: {
    badge: "w-20 h-20",
    emoji: "text-3xl",
    name: "text-sm",
    container: "w-28",
  },
  lg: {
    badge: "w-28 h-28",
    emoji: "text-5xl",
    name: "text-base",
    container: "w-36",
  },
};

export default function AchievementBadge({
  achievement,
  onClick,
  size = "md",
}: AchievementBadgeProps) {
  const tier = tierColors[achievement.tier];
  const sizeClass = sizeClasses[size];

  if (!achievement.is_unlocked) {
    // Locked state
    return (
      <motion.div
        className={`${sizeClass.container} flex flex-col items-center gap-2 cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
      >
        <div
          className={`${sizeClass.badge} rounded-full bg-[var(--cream-dark)] flex items-center justify-center relative overflow-hidden`}
        >
          <span className={`${sizeClass.emoji} grayscale opacity-30`}>
            {achievement.emoji}
          </span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="text-xl">🔒</span>
          </div>
        </div>
        <p
          className={`${sizeClass.name} text-center text-[var(--text-muted)] font-medium line-clamp-2`}
        >
          {achievement.name}
        </p>
      </motion.div>
    );
  }

  // Unlocked state
  return (
    <motion.div
      className={`${sizeClass.container} flex flex-col items-center gap-2 cursor-pointer`}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className={`${sizeClass.badge} rounded-full ${tier.bg} ${tier.border} border-2 flex items-center justify-center shadow-lg ${tier.glow} relative`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </div>
        <span className={`${sizeClass.emoji} drop-shadow-lg`}>
          {achievement.emoji}
        </span>
      </motion.div>
      <p
        className={`${sizeClass.name} text-center text-[var(--text-primary)] font-semibold line-clamp-2`}
      >
        {achievement.name}
      </p>
      <span className="text-xs text-[var(--text-muted)]">
        +{achievement.points} pts
      </span>
    </motion.div>
  );
}
