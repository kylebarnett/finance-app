"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)]">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Welcome Back!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Ready to check on your portfolio?
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Email
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

            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
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
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[var(--coral)] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Fun message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-[var(--text-muted)] mt-6"
        >
          Your virtual portfolio is waiting! 📈
        </motion.p>
      </motion.div>
    </main>
  );
}
