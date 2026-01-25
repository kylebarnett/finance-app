"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FriendGroupCard from "@/components/friends/FriendGroupCard";
import CreateGroupModal from "@/components/friends/CreateGroupModal";
import { useAuth } from "@/components/auth/AuthProvider";

interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  invite_code: string;
  is_active: boolean;
  max_members: number;
  role: "owner" | "admin" | "member";
  member_count: number;
}

export default function FriendsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch("/api/friends/groups");
      const result = await response.json();

      if (result.success) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, fetchGroups]);

  const handleGroupCreated = (newGroup: { id: string; name: string; invite_code: string }) => {
    setGroups(prev => [{
      ...newGroup,
      description: null,
      emoji: "🏆",
      is_active: true,
      max_members: 20,
      role: "owner",
      member_count: 1,
    } as FriendGroup, ...prev]);
    setShowCreateModal(false);
  };

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen">
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
              👥
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
              Trade with Friends!
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Create groups to compete with family and friends. See who can build the best portfolio!
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
    <main className="min-h-screen">
      <Header />

      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2"
            >
              My Groups 👥
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[var(--text-secondary)]"
            >
              Compete with friends and family!
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span className="hidden sm:inline">Create Group</span>
          </motion.button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--cream)] rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--cream)] rounded w-48 mb-2"></div>
                    <div className="h-3 bg-[var(--cream)] rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
              No groups yet!
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Create a group and invite your friends to see who can build the best portfolio!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Group 🚀
            </motion.button>
          </motion.div>
        )}

        {/* Groups List */}
        {!isLoading && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FriendGroupCard
                    id={group.id}
                    name={group.name}
                    description={group.description}
                    emoji={group.emoji}
                    memberCount={group.member_count}
                    maxMembers={group.max_members}
                    role={group.role}
                    inviteCode={group.invite_code}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-4 bg-[var(--cream)]/30 rounded-xl"
            >
              <p className="text-sm text-[var(--text-muted)] text-center">
                <strong>Tip:</strong> Click on a group to see the leaderboard and invite more friends!
              </p>
            </motion.div>
          </motion.div>
        )}
      </section>

      <Footer />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGroupCreated}
      />
    </main>
  );
}
