"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-dark)] rounded-[14px] flex items-center justify-center text-2xl shadow-lg">
            💰
          </div>
          <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Flynn
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)]">
          {/* Email icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-[var(--teal-bg)] rounded-full flex items-center justify-center"
          >
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              📧
            </motion.span>
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
            Check Your Email!
          </h1>

          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            We sent you a magic link to verify your email address.
            Click the link in the email to start your finance adventure!
          </p>

          <div className="bg-[var(--cream)] rounded-xl p-4 mb-6">
            <p className="text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-secondary)]">Tip:</span> If you don't see the email, check your spam folder. Sometimes emails like to hide there!
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-block text-[var(--coral)] font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>

        {/* Fun message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-[var(--text-muted)] mt-6"
        >
          Almost there! Your portfolio is waiting for you 🎉
        </motion.p>
      </motion.div>
    </main>
  );
}
