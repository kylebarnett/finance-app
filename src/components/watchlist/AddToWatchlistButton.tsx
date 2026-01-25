"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddToWatchlistButtonProps {
  symbol: string;
  companyName: string;
  isInWatchlist?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  size?: "small" | "medium" | "large";
}

export default function AddToWatchlistButton({
  symbol,
  companyName,
  isInWatchlist = false,
  onAdd,
  onRemove,
  size = "medium",
}: AddToWatchlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const sizeClasses = {
    small: "w-8 h-8 text-lg",
    medium: "w-10 h-10 text-xl",
    large: "w-12 h-12 text-2xl",
  };

  const handleClick = async () => {
    setIsLoading(true);

    try {
      if (inWatchlist) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist/${symbol}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          setInWatchlist(false);
          setToastMessage(`${companyName} removed from watchlist`);
          setShowToast(true);
          onRemove?.();
        }
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, company_name: companyName }),
        });
        const result = await response.json();

        if (result.success) {
          setInWatchlist(true);
          setToastMessage(`${companyName} added to watchlist!`);
          setShowToast(true);
          onAdd?.();
        } else {
          setToastMessage(result.error || "Something went wrong");
          setShowToast(true);
        }
      }
    } catch {
      setToastMessage("Connection error. Please try again!");
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl transition-all ${
          inWatchlist
            ? "bg-[var(--coral)]/10 text-[var(--coral)]"
            : "bg-[var(--cream)] text-[var(--text-muted)] hover:bg-[var(--coral)]/10 hover:text-[var(--coral)]"
        } disabled:opacity-50`}
        title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⏳
          </motion.span>
        ) : inWatchlist ? (
          "❤️"
        ) : (
          "🤍"
        )}
      </motion.button>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[var(--text-primary)] text-white text-xs font-semibold rounded-lg whitespace-nowrap z-50 shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
