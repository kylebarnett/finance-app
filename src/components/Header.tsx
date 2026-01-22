"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Header() {
  const { user, profile, isLoading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="w-full py-6 px-4 relative z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
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
                Flynn
              </h1>
              <p className="text-xs text-[var(--text-muted)]">Finance for everyone</p>
            </div>
          </motion.div>
        </Link>

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

          {!isLoading && (
            <>
              {user ? (
                <>
                  {/* Portfolio link */}
                  <Link
                    href="/portfolio"
                    className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
                  >
                    Portfolio
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative ml-1" ref={dropdownRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] text-white hover:shadow-md transition-shadow text-lg"
                      aria-label="Profile"
                    >
                      {profile?.avatar_emoji || "🐣"}
                    </motion.button>

                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[var(--cream-dark)] overflow-hidden"
                        >
                          <div className="p-3 border-b border-[var(--cream-dark)]">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {profile?.display_name || "User"}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="p-2">
                            <Link
                              href="/portfolio"
                              onClick={() => setShowDropdown(false)}
                              className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                            >
                              📊 My Portfolio
                            </Link>
                            <button
                              onClick={async () => {
                                await signOut();
                                setShowDropdown(false);
                                window.location.href = "/";
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--down-red)] hover:bg-[var(--down-red-bg)] transition-colors"
                            >
                              👋 Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
                  >
                    Log In
                  </Link>
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2 bg-[var(--text-primary)] text-white font-display font-semibold text-sm rounded-full hover:shadow-md transition-shadow"
                    >
                      <span>Sign Up</span>
                      <span>→</span>
                    </motion.button>
                  </Link>
                </>
              )}
            </>
          )}
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
