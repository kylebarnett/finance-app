"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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

          {/* Success Card */}
          <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)] text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              📧
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Check Your Email!
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Click the link in your email to create a new password. The link expires in 1 hour.
            </p>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-[var(--cream)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--cream-dark)] transition-colors"
              >
                Back to Login
              </motion.button>
            </Link>
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
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Forgot Password?
            </h1>
            <p className="text-[var(--text-secondary)]">
              No worries! Enter your email and we&apos;ll send you a reset link.
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
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
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to login link */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-[var(--coral)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
