"use client";

import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.2 : 1,
                backgroundColor: isCompleted
                  ? "var(--up-green)"
                  : isActive
                  ? "var(--coral)"
                  : "var(--cream-dark)",
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                isActive ? "ring-4 ring-[var(--coral)]/20" : ""
              }`}
            />
            {i < totalSteps - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors ${
                  isCompleted ? "bg-[var(--up-green)]" : "bg-[var(--cream-dark)]"
                }`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
