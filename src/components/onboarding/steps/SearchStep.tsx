"use client";

import { motion } from "framer-motion";

export default function SearchStep() {
  const popularStocks = [
    { emoji: "🍎", name: "Apple", symbol: "AAPL" },
    { emoji: "🎮", name: "Nintendo", symbol: "NTDOY" },
    { emoji: "🏰", name: "Disney", symbol: "DIS" },
    { emoji: "👟", name: "Nike", symbol: "NKE" },
  ];

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-6xl mb-6"
      >
        🔍
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4"
      >
        Find Companies You Know!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-[var(--text-secondary)] max-w-md mx-auto mb-6"
      >
        Search for any company - like the ones that make your favorite games, shoes, or movies!
      </motion.p>

      {/* Mock search box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-sm mx-auto mb-6"
      >
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <div className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-[var(--cream-dark)] rounded-[16px] text-left text-[var(--text-muted)]">
            Search any company...
          </div>
        </div>
      </motion.div>

      {/* Example companies */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <p className="text-sm text-[var(--text-muted)] mb-3">Try searching for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularStocks.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-4 py-2 bg-white/70 rounded-full flex items-center gap-2 shadow-sm"
            >
              <span className="text-lg">{stock.emoji}</span>
              <span className="font-medium text-[var(--text-primary)]">{stock.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tip box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 bg-[var(--sunny-light)]/30 rounded-[16px] max-w-md mx-auto"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-[var(--text-secondary)] text-left">
            <strong>What&apos;s a stock?</strong> It&apos;s like owning a tiny piece of a company.
            When the company does well, your piece becomes more valuable!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
