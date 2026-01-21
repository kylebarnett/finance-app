"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 px-4 mt-16 bg-white/30 backdrop-blur-sm border-t border-white/50">
      <div className="max-w-6xl mx-auto">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[10px] flex items-center justify-center text-xl shadow-md">
              💰
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Money Made Simple
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Making finance fun for everyone</p>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <a href="#markets" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Markets
            </a>
            <a href="#learn" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Search
            </a>
            <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Contact
            </a>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]"
        >
          <p>&copy; {currentYear} Money Made Simple. Made with 💖 for curious minds.</p>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Accessibility</a>
          </div>
        </motion.div>

        {/* Fun sign-off */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-[var(--text-muted)]">
            Keep learning, stay curious! <span className="inline-block animate-bounce-gentle">🚀</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
