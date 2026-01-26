"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AchievementsGrid from "@/components/achievements/AchievementsGrid";
import UnlockModal from "@/components/achievements/UnlockModal";
import type { AchievementWithStatus, Achievement } from "@/lib/types/database";

interface AchievementsData {
  achievements: AchievementWithStatus[];
  byCategory: Record<string, AchievementWithStatus[]>;
  stats: {
    total: number;
    unlocked: number;
    points: number;
    unseen: number;
  };
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements");
      const result = await response.json();

      if (result.success) {
        setData(result.data);

        // Check for unseen achievements to show celebration
        if (result.data.stats.unseen > 0) {
          const unseenAchievement = result.data.achievements.find(
            (a: AchievementWithStatus) => a.is_unlocked && !a.unlocked_at
          );
          if (unseenAchievement) {
            setNewAchievement(unseenAchievement);
          }
        }

        // Mark achievements as seen
        if (result.data.stats.unseen > 0) {
          await fetch("/api/achievements/mark-seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setError("Couldn't load achievements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Calculate progress percentage
  const progressPercent = data ? (data.stats.unlocked / data.stats.total) * 100 : 0;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4"
          >
            Your Achievements
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
          >
            Collect badges as you learn and grow! Each achievement shows how
            awesome you are at Flynn.
          </motion.p>
        </div>
      </section>

      {/* Stats Cards */}
      {data && (
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[20px] p-4 text-center shadow-sm"
              >
                <span className="text-3xl mb-2 block">🎖️</span>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.stats.unlocked}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Unlocked</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-[20px] p-4 text-center shadow-sm"
              >
                <span className="text-3xl mb-2 block">⭐</span>
                <p className="text-2xl font-bold text-[var(--coral)]">
                  {data.stats.points}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Points</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-[20px] p-4 text-center shadow-sm"
              >
                <span className="text-3xl mb-2 block">🎯</span>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.stats.total - data.stats.unlocked}
                </p>
                <p className="text-xs text-[var(--text-muted)]">To Go</p>
              </motion.div>
            </div>

            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 bg-white rounded-[20px] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-[var(--coral)]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-4 bg-[var(--cream)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--coral)] via-[var(--teal)] to-[var(--purple)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                {data.stats.unlocked} of {data.stats.total} achievements
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Achievements Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-4xl inline-block mb-4"
              >
                🏆
              </motion.div>
              <p className="text-[var(--text-muted)]">Loading achievements...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-4">😢</span>
              <p className="text-[var(--text-secondary)] mb-4">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  fetchAchievements();
                }}
                className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--cream-dark)] transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <AchievementsGrid
                achievements={data.achievements}
                byCategory={data.byCategory}
              />
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Tip Card */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-[var(--cream)] to-white rounded-[24px] p-6"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)] mb-1">
                  How to Earn More Badges
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Make trades, grow your portfolio, add stocks to your watchlist,
                  and invite friends to earn more achievements! Each badge earns
                  you points - can you collect them all?
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Celebration Modal for new achievements */}
      <UnlockModal
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </main>
  );
}
