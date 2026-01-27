"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4"
          >
            ⏳
          </motion.div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </motion.div>
      </main>
    );
  }

  // Invalid session - no reset token
  if (!isValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[14px] flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Flynn
            </span>
          </Link>

          <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)] text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <Link href="/auth/forgot-password">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Request New Link
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[14px] flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Flynn
            </span>
          </Link>

          <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)] text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Password Updated!
            </h1>
            <p className="text-[var(--text-secondary)] mb-4">
              Your password has been changed successfully. Redirecting you to the app...
            </p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              ⏳
            </motion.div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[14px] flex items-center justify-center text-2xl shadow-lg">
            💰
          </div>
          <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Flynn
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)]">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Create New Password
            </h1>
            <p className="text-[var(--text-secondary)]">
              Choose a strong password that you haven&apos;t used before.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-xl bg-[var(--down-red-bg)] text-[var(--down-red)] text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
              />
            </div>

            {/* Password match indicator */}
            {confirmPassword && (
              <div className={`text-sm ${password === confirmPassword ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
