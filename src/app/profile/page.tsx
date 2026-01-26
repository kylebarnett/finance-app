"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileStats from "@/components/profile/ProfileStats";
import PrivacySettings from "@/components/profile/PrivacySettings";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Profile } from "@/lib/types/database";

interface ProfileData {
  profile: Profile;
  stats: {
    tradeCount: number;
    achievementCount: number;
    watchlistCount: number;
    groupCount: number;
    memberSince: string;
    daysSinceJoined: number;
  };
  leaderboardSettings: {
    show_on_public_leaderboard: boolean;
    display_name_override: string | null;
  };
  email: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load profile");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSaveProfile = async (name: string, avatar: string) => {
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: name,
        avatar_emoji: avatar,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    // Refresh profile data
    await fetchProfile();
    await refreshProfile();
  };

  const handleSavePrivacy = async (isPublic: boolean, displayName: string | null) => {
    const response = await fetch("/api/leaderboard/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        show_on_public_leaderboard: isPublic,
        display_name_override: displayName,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    // Update local state
    if (profileData) {
      setProfileData({
        ...profileData,
        leaderboardSettings: {
          show_on_public_leaderboard: isPublic,
          display_name_override: displayName,
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Header />
        <section className="w-full max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🔐
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
              Log in to view your profile
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Sign in to customize your profile and manage your settings.
            </p>
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
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <section className="w-full max-w-2xl mx-auto px-4 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
            My Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Customize your Flynn experience
          </p>
        </motion.div>

        {isLoading ? (
          // Loading state
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-4xl inline-block mb-4"
            >
              ⏳
            </motion.div>
            <p className="text-[var(--text-muted)]">Loading profile...</p>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-12">
            <span className="text-4xl block mb-4">😢</span>
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                fetchProfile();
              }}
              className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--cream-dark)] transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : profileData ? (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[24px] p-6 shadow-sm"
            >
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  className="w-20 h-20 bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] rounded-full flex items-center justify-center text-4xl shadow-lg flex-shrink-0"
                >
                  {profileData.profile.avatar_emoji}
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] truncate">
                    {profileData.profile.display_name || "Flynn User"}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] truncate">
                    {profileData.email}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Member since {formatDate(profileData.stats.memberSince)}
                  </p>
                </div>

                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors flex-shrink-0"
                >
                  Edit
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span>📊</span> Your Stats
              </h3>
              <ProfileStats
                tradeCount={profileData.stats.tradeCount}
                achievementCount={profileData.stats.achievementCount}
                watchlistCount={profileData.stats.watchlistCount}
                groupCount={profileData.stats.groupCount}
                daysSinceJoined={profileData.stats.daysSinceJoined}
              />
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[20px] p-4 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2 px-2">
                <span>🔗</span> Quick Links
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/portfolio">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-[var(--cream)]/50 rounded-xl hover:bg-[var(--cream)] transition-colors flex items-center gap-3"
                  >
                    <span className="text-2xl">📊</span>
                    <span className="font-medium text-[var(--text-secondary)]">Portfolio</span>
                  </motion.div>
                </Link>
                <Link href="/achievements">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-[var(--cream)]/50 rounded-xl hover:bg-[var(--cream)] transition-colors flex items-center gap-3"
                  >
                    <span className="text-2xl">🏆</span>
                    <span className="font-medium text-[var(--text-secondary)]">Achievements</span>
                  </motion.div>
                </Link>
                <Link href="/watchlist">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-[var(--cream)]/50 rounded-xl hover:bg-[var(--cream)] transition-colors flex items-center gap-3"
                  >
                    <span className="text-2xl">👀</span>
                    <span className="font-medium text-[var(--text-secondary)]">Watchlist</span>
                  </motion.div>
                </Link>
                <Link href="/friends">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-[var(--cream)]/50 rounded-xl hover:bg-[var(--cream)] transition-colors flex items-center gap-3"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="font-medium text-[var(--text-secondary)]">Friends</span>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PrivacySettings
                isPublic={profileData.leaderboardSettings.show_on_public_leaderboard}
                displayNameOverride={profileData.leaderboardSettings.display_name_override}
                onSave={handleSavePrivacy}
              />
            </motion.div>

            {/* Account Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-[20px] p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span>⚙️</span> Account
              </h3>

              <div className="space-y-3">
                <Link href="/onboarding">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    className="w-full p-4 bg-[var(--cream)]/50 rounded-xl hover:bg-[var(--cream)] transition-colors flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">🎓</span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Tutorial</p>
                      <p className="text-sm text-[var(--text-muted)]">Learn how to use Flynn</p>
                    </div>
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="w-full p-4 bg-[var(--down-red-bg)] rounded-xl hover:bg-[var(--down-red)]/20 transition-colors flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">👋</span>
                  <div>
                    <p className="font-semibold text-[var(--down-red)]">Sign Out</p>
                    <p className="text-sm text-[var(--down-red)]/70">See you later!</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </section>

      <Footer />

      {/* Edit Profile Modal */}
      {profileData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentName={profileData.profile.display_name || ""}
          currentAvatar={profileData.profile.avatar_emoji}
          onSave={handleSaveProfile}
        />
      )}
    </main>
  );
}
