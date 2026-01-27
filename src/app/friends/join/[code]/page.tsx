"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  member_count: number;
  max_members: number;
  is_full: boolean;
  is_member: boolean;
  created_by_name: string;
}

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await fetch(`/api/friends/invite/${resolvedParams.code}`);
        const result = await response.json();

        if (result.success) {
          setGroupInfo(result.data);
        } else {
          setError(result.error || "Invalid invite link");
        }
      } catch {
        setError("Failed to load invite information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupInfo();
  }, [resolvedParams.code]);

  const handleJoin = async () => {
    if (!user) {
      // Store invite code and redirect to signup
      sessionStorage.setItem("pendingGroupInvite", resolvedParams.code);
      router.push("/auth/signup");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const response = await fetch(`/api/friends/invite/${resolvedParams.code}`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setJoined(true);
        // Redirect to group page after a short delay
        setTimeout(() => {
          router.push(`/friends/${result.data.group_id}`);
        }, 1500);
      } else {
        setError(result.error || "Failed to join group");
      }
    } catch {
      setError("Connection error. Please try again!");
    } finally {
      setIsJoining(false);
    }
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-md mx-auto px-4 py-20">
          <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)]">
            <div className="animate-pulse text-center">
              <div className="w-20 h-20 bg-[var(--cream)] rounded-xl mx-auto mb-4"></div>
              <div className="h-6 bg-[var(--cream)] rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-[var(--cream)] rounded w-32 mx-auto"></div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  // Invalid invite
  if (error && !groupInfo) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-md mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)] text-center"
          >
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Invalid Invite
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">{error}</p>
            <Link href="/friends">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[var(--teal)] text-white font-semibold rounded-xl"
              >
                Go to My Groups
              </motion.button>
            </Link>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  // Success state
  if (joined && groupInfo) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-md mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Welcome to {groupInfo.name}!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Taking you to the group...
            </p>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  // Main invite view
  return (
    <main className="min-h-screen">
      <Header />

      <section className="w-full max-w-md mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-soft)]"
        >
          {/* Invite header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              {groupInfo?.emoji}
            </motion.div>
            <p className="text-[var(--text-secondary)] text-sm mb-2">
              {groupInfo?.created_by_name} invited you to join
            </p>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
              {groupInfo?.name}
            </h1>
            {groupInfo?.description && (
              <p className="text-[var(--text-secondary)] mt-2">{groupInfo.description}</p>
            )}
          </div>

          {/* Group stats */}
          <div className="bg-[var(--cream)]/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
              <span className="text-lg">👥</span>
              <span>
                {groupInfo?.member_count} of {groupInfo?.max_members} members
              </span>
            </div>
          </div>

          {/* Already a member */}
          {groupInfo?.is_member && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-[var(--teal)]/10 text-[var(--teal)] rounded-xl text-center"
            >
              <p className="font-semibold">You&apos;re already a member!</p>
            </motion.div>
          )}

          {/* Group is full */}
          {groupInfo?.is_full && !groupInfo?.is_member && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-[var(--down-red-bg)] text-[var(--down-red)] rounded-xl text-center"
            >
              <p className="font-semibold">This group is full!</p>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[var(--down-red-bg)] text-[var(--down-red)] rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Action buttons */}
          {groupInfo?.is_member ? (
            <Link href={`/friends/${groupInfo.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Go to Group
              </motion.button>
            </Link>
          ) : groupInfo?.is_full ? (
            <Link href="/friends">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[var(--cream)] text-[var(--text-primary)] font-display font-semibold rounded-xl"
              >
                View My Groups
              </motion.button>
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  Joining...
                </span>
              ) : user ? (
                "Join Group 🚀"
              ) : (
                "Sign Up to Join 🚀"
              )}
            </motion.button>
          )}

          {/* Login prompt for non-logged-in users */}
          {!user && !groupInfo?.is_full && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link
                  href={`/auth/login?redirect=/friends/join/${resolvedParams.code}`}
                  className="text-[var(--teal)] font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* What is this? */}
          <div className="mt-6 pt-6 border-t border-[var(--cream-dark)]">
            <p className="text-xs text-[var(--text-muted)] text-center">
              <strong>What is this?</strong> Flynn is a fun way to learn about
              investing with paper money. Join this group to compete with friends
              and see who can build the best portfolio!
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
