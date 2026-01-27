"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Achievement } from "@/lib/types/database";

interface UnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

// Confetti piece component
function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100;
  const randomRotate = Math.random() * 360;
  const duration = 2 + Math.random() * 2;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${randomX}%`,
        top: -20,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 400, 600],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [0, randomRotate, randomRotate * 2],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function UnlockModal({ achievement, onClose }: UnlockModalProps) {
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; color: string; delay: number }[]
  >([]);

  const tierMessages = {
    bronze: "You earned a Bronze badge!",
    silver: "Amazing! Silver badge unlocked!",
    gold: "WOW! Gold badge achieved!",
    platinum: "LEGENDARY! Platinum badge!!",
  };

  const tierGradients = {
    bronze: "from-amber-500 to-amber-700",
    silver: "from-slate-300 to-slate-500",
    gold: "from-yellow-300 to-amber-500",
    platinum: "from-cyan-300 via-purple-400 to-pink-400",
  };

  const confettiColors = [
    "#FFD700", // Gold
    "#FF6B6B", // Coral
    "#4ECDC4", // Teal
    "#A855F7", // Purple
    "#3B82F6", // Blue
    "#22C55E", // Green
    "#F97316", // Orange
    "#EC4899", // Pink
  ];

  useEffect(() => {
    if (achievement) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfettiPieces(pieces);
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              color={piece.color}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--card-bg-solid)] rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${tierGradients[achievement.tier]} opacity-10`}
          />

          {/* Celebration text */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="text-4xl">🎉</span>
          </motion.div>

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2"
          >
            Achievement Unlocked!
          </motion.h2>

          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[var(--text-secondary)] text-sm mb-6"
          >
            {tierMessages[achievement.tier]}
          </motion.p>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
            className="relative mb-6"
          >
            <div
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${tierGradients[achievement.tier]} flex items-center justify-center shadow-xl`}
            >
              <motion.span
                className="text-6xl"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {achievement.emoji}
              </motion.span>
            </div>
            {/* Sparkles */}
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-2 text-xl"
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ⭐
            </motion.div>
          </motion.div>

          {/* Achievement name */}
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display text-xl font-bold text-[var(--text-primary)] mb-2"
          >
            {achievement.name}
          </motion.h3>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[var(--text-secondary)] text-sm mb-4"
          >
            {achievement.description}
          </motion.p>

          {/* Points badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--cream)] rounded-full mb-6"
          >
            <span>🏆</span>
            <span className="font-bold text-[var(--coral)]">
              +{achievement.points} points
            </span>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-semibold rounded-xl shadow-lg"
          >
            Awesome! 🎊
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
