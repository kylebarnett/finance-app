"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import WelcomeStep from "@/components/onboarding/steps/WelcomeStep";
import SearchStep from "@/components/onboarding/steps/SearchStep";
import TradeStep from "@/components/onboarding/steps/TradeStep";
import PortfolioStep from "@/components/onboarding/steps/PortfolioStep";
import SocialStep from "@/components/onboarding/steps/SocialStep";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (profile && profile.onboarding_step > 0 && profile.onboarding_step < 5) {
      setCurrentStep(profile.onboarding_step + 1);
    }
  }, [profile]);

  const saveProgress = async (step: number) => {
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      setShowConfetti(true);
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await saveProgress(currentStep);
    router.push("/");
  };

  // Not logged in
  if (!authLoading && !user) {
    router.push("/auth/login");
    return null;
  }

  // Loading
  if (authLoading || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--cream)] to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </main>
    );
  }

  // Completion celebration
  if (showConfetti) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--cream)] to-white overflow-hidden">
        {/* Confetti animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeIn",
              }}
              className="absolute text-2xl"
            >
              {["🎉", "⭐", "🏆", "💰", "📈", "✨"][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-8xl mb-6"
          >
            🎓
          </motion.div>
          <h1 className="font-display text-4xl font-bold text-[var(--text-primary)] mb-4">
            You&apos;re Ready!
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Time to start your investing journey...
          </p>
        </motion.div>
      </main>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            displayName={profile.display_name || "Investor"}
            avatarEmoji={profile.avatar_emoji || "🐣"}
          />
        );
      case 2:
        return <SearchStep />;
      case 3:
        return <TradeStep />;
      case 4:
        return <PortfolioStep />;
      case 5:
        return <SocialStep />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--cream)] to-white">
      <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSkip}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip for now
          </motion.button>
          <span className="text-sm text-[var(--text-muted)]">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>

        <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 pb-8"
        >
          {currentStep > 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="px-6 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
            >
              ← Back
            </motion.button>
          ) : (
            <div />
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={isCompleting}
            className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isCompleting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.span>
                Finishing...
              </span>
            ) : currentStep === TOTAL_STEPS ? (
              "Let's Go! 🚀"
            ) : (
              "Next →"
            )}
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
