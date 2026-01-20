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

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-2"
        >
          <a
            href="#markets"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50 transition-all"
          >
            Markets
          </a>
          <a
            href="#learn"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50 transition-all"
          >
            Learn
          </a>
          <a
            href="#glossary"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50 transition-all"
          >
            Glossary
          </a>
        </motion.nav>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-white font-display font-semibold text-sm rounded-full hover:shadow-lg transition-shadow"
        >
          <span>Start Learning</span>
          <span>→</span>
        </motion.button>
      </div>
    </header>
  );
}
