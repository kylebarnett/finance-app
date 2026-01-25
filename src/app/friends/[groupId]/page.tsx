"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GroupLeaderboard from "@/components/friends/GroupLeaderboard";
import InviteFriendModal from "@/components/friends/InviteFriendModal";
import { useAuth } from "@/components/auth/AuthProvider";
import type { LeaderboardEntry } from "@/lib/types/database";

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  invite_code: string;
  max_members: number;
  role: "owner" | "admin" | "member";
  members: Array<{
    user_id: string;
    role: string;
    joined_at: string;
    display_name: string;
    is_current_user: boolean;
  }>;
  member_count: number;
}

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fetchGroupData = useCallback(async () => {
    try {
      const [groupRes, leaderboardRes] = await Promise.all([
        fetch(`/api/friends/groups/${resolvedParams.groupId}`),
        fetch(`/api/friends/groups/${resolvedParams.groupId}/leaderboard`),
      ]);

      const groupResult = await groupRes.json();
      const leaderboardResult = await leaderboardRes.json();

      if (groupResult.success) {
        setGroup(groupResult.data);
      }

      if (leaderboardResult.success) {
        setLeaderboard(leaderboardResult.data);
      }
    } catch (error) {
      console.error("Failed to fetch group data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.groupId]);

  useEffect(() => {
    if (user) {
      fetchGroupData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, fetchGroupData]);

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      const response = await fetch(`/api/friends/groups/${resolvedParams.groupId}/leave`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        router.push("/friends");
      }
    } catch (error) {
      console.error("Failed to leave group:", error);
    } finally {
      setIsLeaving(false);
      setShowConfirmLeave(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/friends/groups/${resolvedParams.groupId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        router.push("/friends");
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Not logged in
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
            <p className="text-[var(--text-secondary)]">Please log in to view this group.</p>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-8 py-4 bg-[var(--teal)] text-white font-semibold rounded-xl"
              >
                Log In
              </motion.button>
            </Link>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--cream)] rounded w-48 mb-4"></div>
            <div className="h-4 bg-[var(--cream)] rounded w-32 mb-8"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 rounded-[20px] p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--cream)] rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--cream)] rounded w-32 mb-2"></div>
                    <div className="h-3 bg-[var(--cream)] rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  // Group not found
  if (!group) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <div className="text-6xl mb-4">😕</div>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Group not found
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              This group doesn&apos;t exist or you&apos;re not a member.
            </p>
            <Link href="/friends">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[var(--teal)] text-white font-semibold rounded-xl"
              >
                Back to My Groups
              </motion.button>
            </Link>
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
        {/* Back link */}
        <Link href="/friends">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 10H5M5 10l5 5M5 10l5-5" />
            </svg>
            <span>Back to Groups</span>
          </motion.button>
        </Link>

        {/* Group Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-[24px] p-6 shadow-[var(--shadow-soft)] mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 bg-[var(--cream)] rounded-xl flex items-center justify-center text-4xl"
              >
                {group.emoji}
              </motion.div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-[var(--text-secondary)] mt-1">{group.description}</p>
                )}
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {group.member_count} {group.member_count === 1 ? "member" : "members"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Invite Friends 📤
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">
            Group Leaderboard 🏆
          </h2>
          <GroupLeaderboard
            entries={leaderboard}
            currentUserId={user?.id}
            groupEmoji={group.emoji}
          />
        </motion.div>

        {/* Group Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-t border-[var(--cream-dark)] pt-6"
        >
          <h3 className="font-display font-semibold text-[var(--text-secondary)] mb-4">
            Group Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {group.role !== "owner" ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmLeave(true)}
                className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--down-red-bg)] hover:text-[var(--down-red)] transition-colors"
              >
                Leave Group
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--down-red-bg)] hover:text-[var(--down-red)] transition-colors"
              >
                Delete Group
              </motion.button>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* Invite Modal */}
      <InviteFriendModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupName={group.name}
        groupEmoji={group.emoji}
        inviteCode={group.invite_code}
      />

      {/* Leave Confirmation */}
      {showConfirmLeave && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmLeave(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[24px] shadow-2xl z-50 p-6"
          >
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
              Leave Group?
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              You can rejoin later using the invite link.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmLeave(false)}
                className="flex-1 py-3 bg-[var(--cream)] text-[var(--text-primary)] font-semibold rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="flex-1 py-3 bg-[var(--down-red)] text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isLeaving ? "Leaving..." : "Leave"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmDelete(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[24px] shadow-2xl z-50 p-6"
          >
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
              Delete Group?
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              This will remove all members and cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 bg-[var(--cream)] text-[var(--text-primary)] font-semibold rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[var(--down-red)] text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </main>
  );
}
