"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const avatarOptions = [
  "🐣", "🦊", "🐼", "🦁", "🐸", "🦄", "🐶", "🐱",
  "🐰", "🐻", "🐨", "🐯", "🦋", "🐙", "🦖", "🚀"
];

const ageGroups = [
  { value: "8-10", label: "8-10 years old" },
  { value: "11-13", label: "11-13 years old" },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐣");
  const [ageGroup, setAgeGroup] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            display_name: displayName,
            avatar_emoji: selectedAvatar,
            age_group: ageGroup,
            parent_email: parentEmail,
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        // Redirect to email verification page
        window.location.href = "/auth/verify-email";
      }
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
        <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-8 shadow-[var(--shadow-medium)] border border-[var(--cream-dark)]">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              {step === 1 ? "Create Your Account" : "Almost There!"}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {step === 1
                ? "Pick an avatar and tell us about yourself"
                : "Just a few more details"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-[var(--coral)]" : "bg-[var(--cream-dark)]"}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-[var(--coral)]" : "bg-[var(--cream-dark)]"}`} />
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

          <form onSubmit={handleSignup}>
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Avatar picker */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Pick your avatar
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`
                          w-10 h-10 text-2xl rounded-xl flex items-center justify-center
                          transition-all duration-200
                          ${selectedAvatar === avatar
                            ? "bg-[var(--coral)] scale-110 shadow-lg"
                            : "bg-[var(--cream)] hover:bg-[var(--cream-dark)]"
                          }
                        `}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your nickname"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Age group */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    How old are you?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ageGroups.map((age) => (
                      <button
                        key={age.value}
                        type="button"
                        onClick={() => setAgeGroup(age.value)}
                        className={`
                          px-4 py-3 rounded-xl text-sm font-medium
                          transition-all duration-200
                          ${ageGroup === age.value
                            ? "bg-[var(--coral)] text-white"
                            : "bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)]"
                          }
                        `}
                      >
                        {age.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!displayName || !ageGroup}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Selected avatar preview */}
                <div className="text-center mb-4">
                  <span className="text-5xl">{selectedAvatar}</span>
                  <p className="text-[var(--text-secondary)] mt-2">Hi, {displayName}!</p>
                </div>

                {/* Parent email */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Parent&apos;s email (required)
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--cream)] border-2 border-transparent focus:border-[var(--coral)] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    We&apos;ll send them a message so they know you&apos;re learning about finance!
                  </p>
                </div>

                {/* User email */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Your email
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

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Create a password
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl bg-[var(--cream)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--cream-dark)] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !email || !password || !parentEmail}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                        Creating...
                      </span>
                    ) : (
                      "Start Learning! 🚀"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--coral)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
