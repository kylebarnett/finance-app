"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Header() {
  const { user, profile, isLoading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Track when component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showDropdown || showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showMobileMenu]);

  // Close mobile menu on route change
  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <header className="w-full py-6 px-4 relative z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        {/* Navigation + CTA unified */}
        <nav className="hidden sm:flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50">
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Home
          </Link>
          <Link
            href="/#markets"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Markets
          </Link>
          <Link
            href="/#learn"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Search
          </Link>

          {/* Portfolio and Watchlist - always visible */}
          <Link
            href="/portfolio"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Portfolio
          </Link>
          <Link
            href="/watchlist"
            className="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/80 transition-all"
          >
            Watchlist
          </Link>

          {/* Auth-dependent section: profile avatar or login buttons */}
          {!mounted || isLoading ? (
            <div className="ml-1 w-9 h-9 rounded-full bg-[var(--cream)] animate-pulse" />
          ) : user ? (
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
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[var(--cream-dark)] overflow-hidden z-50"
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
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        👤 Profile
                      </Link>
                      <Link
                        href="/portfolio"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        📊 My Portfolio
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        ❤️ Watchlist
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        🏆 Leaderboard
                      </Link>
                      <Link
                        href="/friends"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        👥 Friends
                      </Link>
                      <Link
                        href="/achievements"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        🎖️ Achievements
                      </Link>
                      <div className="border-t border-[var(--cream-dark)] my-1" />
                      <Link
                        href="/onboarding"
                        onClick={() => setShowDropdown(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                      >
                        🎓 Tutorial
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
        </nav>

        {/* Mobile menu button */}
        <div className="sm:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/50"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {showMobileMenu ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 5l10 10M15 5l-10 10" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h14M3 10h14M3 14h14" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-4 top-20 w-64 bg-white rounded-2xl shadow-xl border border-[var(--cream-dark)] overflow-hidden z-50"
              >
                {/* Navigation Links - always visible */}
                <div className="p-2">
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                  >
                    🏠 Home
                  </Link>
                  <Link
                    href="/#markets"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                  >
                    📈 Markets
                  </Link>
                  <Link
                    href="/#learn"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                  >
                    🔍 Search
                  </Link>
                  <Link
                    href="/portfolio"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                  >
                    📊 Portfolio
                  </Link>
                  <Link
                    href="/watchlist"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                  >
                    ❤️ Watchlist
                  </Link>
                </div>

                {/* Auth-dependent section */}
                {!mounted || isLoading ? (
                  <>
                    <div className="border-t border-[var(--cream-dark)]" />
                    <div className="p-3">
                      <div className="h-10 bg-[var(--cream)] rounded-xl animate-pulse" />
                    </div>
                  </>
                ) : user ? (
                  <>
                    <div className="border-t border-[var(--cream-dark)]" />
                    <div className="p-2">
                      {/* User info */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)] flex items-center justify-center text-xl">
                          {profile?.avatar_emoji || "🐣"}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {profile?.display_name || "User"}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate max-w-[140px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[var(--cream-dark)]" />
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                      >
                        👤 Profile
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                      >
                        🏆 Leaderboard
                      </Link>
                      <Link
                        href="/friends"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                      >
                        👥 Friends
                      </Link>
                      <Link
                        href="/achievements"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                      >
                        🎖️ Achievements
                      </Link>
                      <Link
                        href="/onboarding"
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium"
                      >
                        🎓 Tutorial
                      </Link>
                    </div>
                    <div className="border-t border-[var(--cream-dark)]" />
                    <div className="p-2">
                      <button
                        onClick={async () => {
                          await signOut();
                          closeMobileMenu();
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl text-[var(--down-red)] hover:bg-[var(--down-red-bg)] transition-colors font-medium"
                      >
                        👋 Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t border-[var(--cream-dark)]" />
                    <div className="p-3">
                      <Link
                        href="/auth/login"
                        onClick={closeMobileMenu}
                        className="block w-full px-4 py-3 text-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors font-medium mb-2"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={closeMobileMenu}
                        className="block w-full px-4 py-3 text-center rounded-xl bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-semibold"
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
