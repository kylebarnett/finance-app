"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="w-full py-6 px-4 relative z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[14px] flex items-center justify-center text-2xl shadow-[var(--shadow-glow-coral)]"
          >
            💰
          </motion.div>
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Money Made Simple
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Finance for everyone</p>
          </div>
        </motion.div>

        {/* Navigation + CTA unified */}
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50"
        >
          <a
            href="#markets"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Markets
          </a>
          <a
            href="#learn"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Search
          </a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--text-primary)] text-white font-display font-semibold text-sm rounded-full hover:shadow-md transition-shadow"
          >
            <span>Start Learning</span>
            <span>→</span>
          </motion.button>

          {/* Profile button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-1 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] text-white hover:shadow-md transition-shadow"
            aria-label="Profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </motion.button>
        </motion.nav>

        {/* Mobile menu button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/50"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </motion.button>
      </div>
    </header>
  );
}
