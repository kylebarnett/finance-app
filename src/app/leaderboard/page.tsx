"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeaderboardPodium from "@/components/leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import PrivacyToggle from "@/components/leaderboard/PrivacyToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import type { LeaderboardEntry, LeaderboardSettings } from "@/lib/types/database";

export default function LeaderboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [settings, setSettings] = useState<LeaderboardSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const result = await response.json();

      if (result.success) {
        setLeaderboard(result.data);

        // Find current user's rank if they're on the leaderboard
        if (user) {
          const userEntry = result.data.find((e: LeaderboardEntry) => e.user_id === user.id);
          setUserRank(userEntry || null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, [user]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/leaderboard/settings");
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLeaderboard(), fetchSettings()]);
      setIsLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, fetchLeaderboard, fetchSettings]);

  const handleTogglePrivacy = async (isPublic: boolean, displayName: string | null) => {
    try {
      const response = await fetch("/api/leaderboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          show_on_public_leaderboard: isPublic,
          display_name_override: displayName,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        // Refresh leaderboard to show/hide user
        await fetchLeaderboard();
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3"
          >
            Leaderboard 🏆
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)] max-w-md mx-auto"
          >
            See how you stack up against other paper traders!
          </motion.p>
        </motion.div>

        {/* Privacy settings for logged-in users */}
        {user && !authLoading && settings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <PrivacyToggle
              isPublic={settings.show_on_public_leaderboard}
              displayName={settings.display_name_override}
              onToggle={handleTogglePrivacy}
            />
          </motion.div>
        )}

        {/* User's current rank (if on leaderboard) */}
        {user && userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[var(--teal)]/10 to-[var(--coral)]/10 rounded-[20px] p-4 mb-8 border border-[var(--teal)]/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{userRank.avatar_emoji}</span>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Your Rank</p>
                  <p className="font-display text-2xl font-bold text-[var(--text-primary)]">
                    #{userRank.rank} of {leaderboard.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">Portfolio Value</p>
                <p className="font-display text-xl font-bold text-[var(--text-primary)]">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(userRank.total_value)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-end justify-center gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-32 h-24 bg-[var(--cream)] rounded-2xl mb-2"></div>
                  <div className={`w-32 ${i === 2 ? "h-36" : i === 1 ? "h-28" : "h-24"} bg-[var(--cream)] rounded-t-xl`}></div>
                </div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--cream)] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--cream)] rounded w-32 mb-2"></div>
                    <div className="h-3 bg-[var(--cream)] rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-[var(--cream)] rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && leaderboard.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
              The leaderboard is empty!
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Be the first to join! Start trading and toggle on "Show on Leaderboard" above to compete.
            </p>
            {!user && (
              <div className="flex items-center justify-center gap-4">
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[var(--cream)] text-[var(--text-primary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
                  >
                    Log In
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign Up Free
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Leaderboard Content */}
        {!isLoading && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Podium for top 3 */}
            <LeaderboardPodium entries={leaderboard} />

            {/* Table for 4th place and beyond */}
            <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />

            {/* Encouragement message */}
            {user && !userRank && settings && !settings.show_on_public_leaderboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <p className="text-[var(--text-secondary)]">
                  Toggle the switch above to join the leaderboard! 🚀
                </p>
              </motion.div>
            )}

            {!user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <p className="text-[var(--text-secondary)] mb-4">
                  Want to compete? Create an account to start trading!
                </p>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started 🚀
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </section>

      <Footer />
    </main>
  );
}
