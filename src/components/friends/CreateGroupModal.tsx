"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group: { id: string; name: string; invite_code: string }) => void;
}

const emojiOptions = ["🏆", "🚀", "💰", "📈", "🌟", "🎯", "💎", "🦁", "🔥", "⚡", "🎮", "🎲"];

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🏆");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Group name must be at least 2 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/friends/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          emoji,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
        setName("");
        setDescription("");
        setEmoji("🏆");
      } else {
        setError(result.error || "Failed to create group");
      }
    } catch {
      setError("Connection error. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setEmoji("🏆");
      setError("");
      onClose();
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
            onClick={handleClose}
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
            <div className="bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">Create a Group</h2>
                  <p className="text-white/80 text-sm mt-1">
                    Compete with friends and family!
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5l-10 10" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Emoji picker */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Group Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((em) => (
                    <motion.button
                      key={em}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEmoji(em)}
                      className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                        emoji === em
                          ? "bg-[var(--teal)] ring-2 ring-[var(--teal)] ring-offset-2"
                          : "bg-[var(--cream)] hover:bg-[var(--cream-dark)]"
                      }`}
                    >
                      {em}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Smith Family Traders"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] text-[var(--text-primary)]"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group about?"
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] text-[var(--text-primary)] resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-[var(--down-red-bg)] text-[var(--down-red)] rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || name.trim().length < 2}
                className="w-full py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    Creating...
                  </span>
                ) : (
                  "Create Group 🎉"
                )}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
