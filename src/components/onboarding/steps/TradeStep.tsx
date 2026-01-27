"use client";

import { motion } from "framer-motion";

export default function TradeStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-6xl mb-6"
      >
        🛒
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4"
      >
        Making Your First Trade
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-[var(--text-secondary)] max-w-md mx-auto mb-8"
      >
        Buying stocks is easy! Here&apos;s how it works:
      </motion.p>

      {/* Steps illustration */}
      <div className="space-y-4 max-w-sm mx-auto">
        {[
          { emoji: "🔍", title: "1. Find a stock", desc: "Search for a company you like" },
          { emoji: "💵", title: "2. Choose amount", desc: "Pick how many shares or dollars" },
          { emoji: "✅", title: "3. Buy it!", desc: "Click the buy button" },
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex items-center gap-4 p-4 bg-[var(--card-bg)]/70 rounded-[16px] text-left"
          >
            <div className="w-12 h-12 bg-[var(--cream)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {step.emoji}
            </div>
            <div>
              <p className="font-display font-bold text-[var(--text-primary)]">{step.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mock trade card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 bg-gradient-to-r from-[var(--teal-light)]/30 to-[var(--mint-light)]/30 rounded-[20px] max-w-sm mx-auto border-2 border-[var(--teal)]/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <span className="font-display font-bold">Apple</span>
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)]">$175.50</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="py-3 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl text-center"
        >
          Buy AAPL
        </motion.div>
      </motion.div>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-6 text-sm text-[var(--text-muted)]"
      >
        Remember: This is practice money, so feel free to experiment!
      </motion.p>
    </div>
  );
}
