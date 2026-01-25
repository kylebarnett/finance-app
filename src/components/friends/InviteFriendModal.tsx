"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupEmoji: string;
  inviteCode: string;
}

export default function InviteFriendModal({
  isOpen,
  onClose,
  groupName,
  groupEmoji,
  inviteCode,
}: InviteFriendModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/friends/join/${inviteCode}`
    : `/friends/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on Flynn!`,
          text: `Join my trading group "${groupName}" and let's see who can grow their portfolio the most!`,
          url: inviteUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[24px] shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">Invite Friends</h2>
                  <p className="text-white/80 text-sm mt-1">
                    Share this link to invite others!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Group info */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-[var(--cream)]/50 rounded-xl">
                <span className="text-3xl">{groupEmoji}</span>
                <div>
                  <p className="font-display font-bold text-[var(--text-primary)]">{groupName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">Invite code: {inviteCode}</p>
                </div>
              </div>

              {/* Invite link */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Share this link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--text-primary)] text-sm truncate"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      copied
                        ? "bg-[var(--up-green)] text-white"
                        : "bg-[var(--cream)] text-[var(--text-primary)] hover:bg-[var(--cream-dark)]"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </motion.button>
                </div>
              </div>

              {/* Share button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="w-full py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Share Invite</span>
                <span>📤</span>
              </motion.button>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-[var(--cream)]/30 rounded-xl">
                <p className="text-sm text-[var(--text-secondary)]">
                  <strong>How it works:</strong> Friends who click this link can sign up (or log in) and automatically join your group. You'll all compete on the same leaderboard!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
