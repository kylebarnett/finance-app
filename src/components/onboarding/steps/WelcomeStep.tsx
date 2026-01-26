"use client";

import { motion } from "framer-motion";

interface WelcomeStepProps {
  displayName: string;
  avatarEmoji: string;
}

export default function WelcomeStep({ displayName, avatarEmoji }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[28px] flex items-center justify-center text-5xl shadow-lg"
      >
        {avatarEmoji}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4"
      >
        Welcome to Flynn, {displayName}!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 text-lg text-[var(--text-secondary)] max-w-md mx-auto"
      >
        <p>
          You&apos;re about to learn how to invest - with no risk at all!
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-r from-[var(--up-green-bg)] to-[var(--teal-light)]/20 rounded-[20px] border-2 border-[var(--up-green)]/30"
        >
          <div className="text-4xl mb-2">💰</div>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)]">
            $10,000
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Virtual money to practice with!
          </p>
        </motion.div>

        <p className="text-base">
          This is pretend money - you can&apos;t lose anything real.
          It&apos;s like a video game for learning about stocks!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-center gap-2"
      >
        {["📈", "🎓", "🏆"].map((emoji, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="text-2xl"
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
