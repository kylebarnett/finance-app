"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarPicker from "./AvatarPicker";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatar: string;
  onSave: (name: string, avatar: string) => Promise<void>;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentAvatar,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a display name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(name.trim(), avatar);
      onClose();
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    setAvatar(emoji);
  };

  return (
    <>
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card-bg-solid)] rounded-[24px] shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--cream-dark)]">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                    Edit Profile
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cream)] hover:bg-[var(--cream-dark)] transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Your Avatar
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAvatarPicker(true)}
                    className="relative inline-block"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] rounded-full flex items-center justify-center text-5xl shadow-lg">
                      {avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--coral)] rounded-full flex items-center justify-center text-white shadow-md">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M10 2l2 2M2 10l6-6 2 2-6 6H2v-2z" />
                      </svg>
                    </div>
                  </motion.button>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Tap to change
                  </p>
                </div>

                {/* Display Name */}
                <div className="mb-6">
                  <label className="block mb-2">
                    <span className="font-semibold text-[var(--text-primary)] text-sm">
                      Display Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    placeholder="Your name"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] text-lg"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {30 - name.length} characters remaining
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-[var(--down-red-bg)] text-[var(--down-red)] rounded-xl text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        currentAvatar={avatar}
        onSelect={handleAvatarSelect}
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />
    </>
  );
}
