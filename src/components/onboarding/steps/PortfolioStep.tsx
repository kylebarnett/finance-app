"use client";

import { motion } from "framer-motion";

export default function PortfolioStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-6xl mb-6"
      >
        📊
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4"
      >
        Your Portfolio
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-[var(--text-secondary)] max-w-md mx-auto mb-6"
      >
        Your portfolio shows all the stocks you own and how they&apos;re doing!
      </motion.p>

      {/* Mock portfolio card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-sm mx-auto bg-[var(--card-bg)]/70 rounded-[20px] p-5 shadow-sm mb-6"
      >
        <div className="text-left mb-4">
          <p className="text-sm text-[var(--text-muted)]">Total Portfolio Value</p>
          <p className="font-display text-3xl font-bold text-[var(--text-primary)]">$10,245.50</p>
          <p className="text-sm font-semibold text-[var(--up-green)]">+$245.50 (+2.45%)</p>
        </div>

        <div className="border-t border-[var(--cream-dark)] pt-4 space-y-3">
          {[
            { emoji: "🍎", symbol: "AAPL", value: "$525.00", change: "+5.2%" },
            { emoji: "🎮", symbol: "NTDOY", value: "$320.50", change: "+2.1%" },
          ].map((holding, i) => (
            <motion.div
              key={holding.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{holding.emoji}</span>
                <span className="font-semibold text-[var(--text-primary)]">{holding.symbol}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--text-primary)]">{holding.value}</p>
                <p className="text-xs text-[var(--up-green)]">{holding.change}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Explanation cards */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-[var(--up-green-bg)] rounded-[14px] text-left"
        >
          <span className="text-xl">📈</span>
          <p className="font-semibold text-[var(--up-green)] text-sm mt-1">Green = Profit!</p>
          <p className="text-xs text-[var(--text-secondary)]">Your stock went up</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-3 bg-[var(--down-red-bg)] rounded-[14px] text-left"
        >
          <span className="text-xl">📉</span>
          <p className="font-semibold text-[var(--down-red)] text-sm mt-1">Red = Loss</p>
          <p className="text-xs text-[var(--text-secondary)]">Your stock went down</p>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-sm text-[var(--text-muted)] max-w-xs mx-auto"
      >
        Stocks go up and down all the time - that&apos;s normal! The key is learning and having fun.
      </motion.p>
    </div>
  );
}
