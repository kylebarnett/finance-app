"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AchievementBadge from "./AchievementBadge";
import type { AchievementWithStatus } from "@/lib/types/database";

interface AchievementsGridProps {
  achievements: AchievementWithStatus[];
  byCategory?: Record<string, AchievementWithStatus[]>;
}

const categoryInfo: Record<
  string,
  { name: string; emoji: string; description: string }
> = {
  trading: {
    name: "Trading",
    emoji: "📊",
    description: "Earn these by making trades!",
  },
  portfolio: {
    name: "Portfolio",
    emoji: "💰",
    description: "Grow your portfolio to unlock these!",
  },
  learning: {
    name: "Learning",
    emoji: "🎓",
    description: "Complete lessons and tutorials!",
  },
  social: {
    name: "Social",
    emoji: "🤝",
    description: "Connect with friends and watch stocks!",
  },
  streaks: {
    name: "Streaks",
    emoji: "🔥",
    description: "Keep coming back every day!",
  },
};

const categoryOrder = ["trading", "portfolio", "learning", "social", "streaks"];

export default function AchievementsGrid({
  achievements,
  byCategory,
}: AchievementsGridProps) {
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementWithStatus | null>(null);

  // Group by category if not provided
  const groupedAchievements =
    byCategory ||
    achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, AchievementWithStatus[]>);

  // Sort categories
  const sortedCategories = categoryOrder.filter(
    (cat) => groupedAchievements[cat]?.length > 0
  );

  return (
    <>
      <div className="space-y-8">
        {sortedCategories.map((category, categoryIndex) => {
          const info = categoryInfo[category];
          const categoryAchievements = groupedAchievements[category];
          const unlockedCount = categoryAchievements.filter(
            (a) => a.is_unlocked
          ).length;
          const totalCount = categoryAchievements.length;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      {info.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {info.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {unlockedCount}/{totalCount}
                  </span>
                  {/* Progress bar */}
                  <div className="w-16 h-2 bg-[var(--cream-dark)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--coral)] to-[var(--teal)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(unlockedCount / totalCount) * 100}%`,
                      }}
                      transition={{ delay: categoryIndex * 0.1 + 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {categoryAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: categoryIndex * 0.1 + index * 0.05,
                    }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      onClick={() => setSelectedAchievement(achievement)}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--card-bg-solid)] rounded-[24px] shadow-2xl z-50 p-6"
            >
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cream)] hover:bg-[var(--cream-dark)] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>

              <div className="text-center">
                {/* Badge */}
                <div className="mb-4">
                  <AchievementBadge
                    achievement={selectedAchievement}
                    size="lg"
                  />
                </div>

                {/* Description */}
                <p className="text-[var(--text-secondary)] mb-4">
                  {selectedAchievement.description}
                </p>

                {/* Status */}
                {selectedAchievement.is_unlocked ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--up-green-bg)] text-[var(--up-green)] rounded-full text-sm font-medium">
                    <span>✅</span>
                    <span>
                      Unlocked{" "}
                      {selectedAchievement.unlocked_at
                        ? new Date(
                            selectedAchievement.unlocked_at
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--cream)] text-[var(--text-muted)] rounded-full text-sm font-medium">
                    <span>🔒</span>
                    <span>Keep going to unlock!</span>
                  </div>
                )}

                {/* Tier and points */}
                <div className="flex justify-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
                  <span className="capitalize">{selectedAchievement.tier}</span>
                  <span>•</span>
                  <span>{selectedAchievement.points} points</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
