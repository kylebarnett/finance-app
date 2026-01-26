"use client";

import { motion } from "framer-motion";

export default function SocialStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-6xl mb-6"
      >
        🏆
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4"
      >
        Learn Together!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-[var(--text-secondary)] max-w-md mx-auto mb-8"
      >
        Flynn is more fun with friends and family!
      </motion.p>

      {/* Feature cards */}
      <div className="space-y-4 max-w-sm mx-auto">
        {[
          {
            emoji: "❤️",
            title: "Watchlist",
            desc: "Save stocks you want to keep an eye on",
            color: "from-[var(--coral)]/10 to-[var(--coral)]/5",
          },
          {
            emoji: "🏆",
            title: "Leaderboard",
            desc: "See how you rank against other traders",
            color: "from-[var(--sunny)]/10 to-[var(--sunny)]/5",
          },
          {
            emoji: "👥",
            title: "Friend Groups",
            desc: "Create groups and compete with friends!",
            color: "from-[var(--teal)]/10 to-[var(--teal)]/5",
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={`flex items-center gap-4 p-4 bg-gradient-to-r ${feature.color} rounded-[16px] text-left`}
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
              {feature.emoji}
            </div>
            <div>
              <p className="font-display font-bold text-[var(--text-primary)]">{feature.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Invite prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 bg-[var(--lavender-light)]/30 rounded-[16px] max-w-sm mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">💡</span>
          <span className="font-semibold text-[var(--text-primary)]">Pro Tip</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a friend group and share the link with your family to see who can grow their portfolio the most!
        </p>
      </motion.div>
    </div>
  );
}
