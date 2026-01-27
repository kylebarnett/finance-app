"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* 404 illustration */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          🔍
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display text-6xl font-bold text-[var(--coral)] mb-4"
        >
          404
        </motion.h1>

        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
          Page Not Found
        </h2>

        <p className="text-[var(--text-secondary)] mb-8">
          Hmm, we couldn&apos;t find that page. It might have moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Go Home
            </motion.button>
          </Link>

          <Link href="/portfolio">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[var(--cream)] text-[var(--text-secondary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
            >
              My Portfolio
            </motion.button>
          </Link>
        </div>

        {/* Fun suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-[var(--card-bg)]/50 rounded-2xl"
        >
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            While you&apos;re here, you could:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/watchlist">
              <span className="px-3 py-1 bg-[var(--teal)]/20 text-[var(--teal-dark)] rounded-full text-sm hover:bg-[var(--teal)]/30 transition-colors">
                Check Watchlist
              </span>
            </Link>
            <Link href="/achievements">
              <span className="px-3 py-1 bg-[var(--sunny)]/20 text-[var(--sunny-dark)] rounded-full text-sm hover:bg-[var(--sunny)]/30 transition-colors">
                View Achievements
              </span>
            </Link>
            <Link href="/leaderboard">
              <span className="px-3 py-1 bg-[var(--coral)]/20 text-[var(--coral-dark)] rounded-full text-sm hover:bg-[var(--coral)]/30 transition-colors">
                See Leaderboard
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
