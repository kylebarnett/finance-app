"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacySettingsProps {
  isPublic: boolean;
  displayNameOverride: string | null;
  onSave: (isPublic: boolean, displayNameOverride: string | null) => Promise<void>;
}

export default function PrivacySettings({
  isPublic: initialIsPublic,
  displayNameOverride: initialDisplayName,
  onSave,
}: PrivacySettingsProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = () => {
    setIsPublic(!isPublic);
    setHasChanges(true);
  };

  const handleNameChange = (value: string) => {
    setDisplayName(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(isPublic, displayName.trim() || null);
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>🔒</span> Privacy Settings
      </h3>

      {/* Leaderboard toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="font-semibold text-[var(--text-primary)]">
            Show on Public Leaderboard
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Others can see your rank and portfolio value
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${
            isPublic ? "bg-[var(--up-green)]" : "bg-[var(--cream-dark)]"
          }`}
        >
          <motion.div
            animate={{ x: isPublic ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-xs"
          >
            {isPublic ? "✓" : ""}
          </motion.div>
        </motion.button>
      </div>

      {/* Privacy assurance */}
      <div className="bg-[var(--cream)]/50 rounded-xl p-3 mb-4">
        <p className="text-xs text-[var(--text-muted)] flex items-start gap-2">
          <span className="text-base">🔐</span>
          <span>
            <strong>Privacy promise:</strong> Your specific stocks and trade history are never shared.
            Only your total portfolio value appears on the leaderboard.
          </span>
        </p>
      </div>

      {/* Display name override */}
      {isPublic && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-[var(--cream-dark)] pt-4 mb-4"
        >
          <label className="block mb-2">
            <span className="font-semibold text-[var(--text-primary)] text-sm">
              Leaderboard Display Name
            </span>
            <span className="text-xs text-[var(--text-muted)] ml-2">
              (optional - leave blank to use your profile name)
            </span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Your nickname on the leaderboard"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] text-sm"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {30 - displayName.length} characters remaining
          </p>
        </motion.div>
      )}

      {/* Save button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Privacy Settings"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-[var(--up-green-bg)] text-[var(--up-green)] rounded-xl text-sm text-center font-semibold"
          >
            Settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
