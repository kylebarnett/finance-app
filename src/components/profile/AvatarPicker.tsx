"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarPickerProps {
  currentAvatar: string;
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const avatarCategories = {
  animals: {
    name: "Animals",
    emoji: "🐾",
    avatars: ["🐣", "🦊", "🐼", "🦁", "🐸", "🦄", "🐶", "🐱", "🐰", "🐻", "🐨", "🐯", "🦋", "🐙", "🦖"],
  },
  nature: {
    name: "Space & Nature",
    emoji: "🌟",
    avatars: ["🚀", "🌟", "⭐", "🌈", "🌸", "🌺", "🍀", "🌙", "☀️"],
  },
  fun: {
    name: "Fun",
    emoji: "🎮",
    avatars: ["🎮", "🎨", "🎵", "🏆", "💎", "🔥"],
  },
};

export default function AvatarPicker({
  currentAvatar,
  onSelect,
  isOpen,
  onClose,
}: AvatarPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);

  const handleSelect = (emoji: string) => {
    setPreviewAvatar(emoji);
  };

  const handleConfirm = () => {
    onSelect(previewAvatar);
    onClose();
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
            <div className="p-6 border-b border-[var(--cream-dark)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  Choose Your Avatar
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

              {/* Preview */}
              <div className="mt-4 flex justify-center">
                <motion.div
                  key={previewAvatar}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-24 h-24 bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] rounded-full flex items-center justify-center text-5xl shadow-lg"
                >
                  {previewAvatar}
                </motion.div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-[var(--cream-dark)]">
              {Object.entries(avatarCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? "bg-[var(--cream)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--cream)]/50"
                  }`}
                >
                  <span className="mr-1">{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div className="p-4 max-h-[240px] overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {avatarCategories[selectedCategory as keyof typeof avatarCategories].avatars.map(
                  (emoji, index) => (
                    <motion.button
                      key={emoji}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(emoji)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                        previewAvatar === emoji
                          ? "bg-[var(--teal)]/20 ring-2 ring-[var(--teal)] scale-110"
                          : "bg-[var(--cream)] hover:bg-[var(--cream-dark)] hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--cream-dark)] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-semibold rounded-xl"
              >
                Save Avatar
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
