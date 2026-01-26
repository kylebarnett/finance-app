"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

export default function EmptyState({
  emoji,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  const ActionButton = action?.href ? (
    <Link href={action.href}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {action.label}
      </motion.button>
    </Link>
  ) : action?.onClick ? (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={action.onClick}
      className="px-6 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
    >
      {action.label}
    </motion.button>
  ) : null;

  const SecondaryButton = secondaryAction?.href ? (
    <Link href={secondaryAction.href}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
      >
        {secondaryAction.label}
      </motion.button>
    </Link>
  ) : secondaryAction?.onClick ? (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={secondaryAction.onClick}
      className="px-6 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
    >
      {secondaryAction.label}
    </motion.button>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="text-6xl mb-6"
      >
        {emoji}
      </motion.div>

      <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
        {title}
      </h3>

      <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {ActionButton}
          {SecondaryButton}
        </div>
      )}

      {children && <div className="mt-8">{children}</div>}
    </motion.div>
  );
}
