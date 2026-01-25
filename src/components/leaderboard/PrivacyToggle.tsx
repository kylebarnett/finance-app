"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyToggleProps {
  isPublic: boolean;
  displayName: string | null;
  onToggle: (isPublic: boolean, displayName: string | null) => Promise<void>;
}

export default function PrivacyToggle({ isPublic, displayName, onToggle }: PrivacyToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || "");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(!isPublic, displayName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to toggle privacy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (newDisplayName === displayName) {
      setShowNameInput(false);
      return;
    }

    setIsLoading(true);
    try {
      await onToggle(isPublic, newDisplayName || null);
      setShowNameInput(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to save display name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-[20px] p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{isPublic ? "🌟" : "🔒"}</span>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              {isPublic ? "You're on the Leaderboard!" : "Join the Leaderboard"}
            </h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            {isPublic
              ? "Other investors can see your rank and portfolio value. Your actual holdings are always private!"
              : "Show your rank on the public leaderboard. Only your display name and total portfolio value will be visible."}
          </p>

          {/* Privacy assurance */}
          <div className="bg-[var(--cream)]/50 rounded-xl p-3 mb-4">
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span>🔐</span>
              <span>
                <strong>Privacy promise:</strong> Your specific stocks and trade history are never shared.
                Only your total portfolio value appears on the leaderboard.
              </span>
            </p>
          </div>

          {/* Display name section (only when public) */}
          {isPublic && (
            <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Display Name
                </p>
                {!showNameInput && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNameInput(true)}
                    className="text-[var(--teal)] text-sm font-semibold hover:underline"
                  >
                    Edit
                  </motion.button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showNameInput ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Your nickname"
                      maxLength={30}
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveName}
                      disabled={isLoading}
                      className="px-4 py-2 bg-[var(--teal)] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowNameInput(false);
                        setNewDisplayName(displayName || "");
                      }}
                      className="px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--text-secondary)]"
                  >
                    {displayName || "Using your first name"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Toggle switch */}
        <div className="flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${
              isPublic ? "bg-[var(--up-green)]" : "bg-[var(--cream-dark)]"
            } disabled:opacity-50`}
          >
            <motion.div
              animate={{ x: isPublic ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-xs"
            >
              {isLoading ? "⏳" : isPublic ? "✓" : ""}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-[var(--up-green-bg)] text-[var(--up-green)] rounded-xl text-sm text-center font-semibold"
          >
            ✅ Settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
