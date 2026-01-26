"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (could be sent to error reporting service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Error illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          😵
        </motion.div>

        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-[var(--text-secondary)] mb-8">
          Don&apos;t worry, this happens sometimes! Let&apos;s try to fix it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[var(--cream)] text-[var(--text-secondary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
            >
              Go Home
            </motion.button>
          </Link>
        </div>

        {/* Fun recovery message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-[var(--text-muted)] mt-8"
        >
          Even the best investors have bad days! 📈
        </motion.p>
      </motion.div>
    </main>
  );
}
