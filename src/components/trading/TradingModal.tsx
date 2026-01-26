"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "buy" | "sell";
  symbol: string;
  companyName: string;
  currentPrice: number;
  emoji?: string;
  maxQuantity?: number; // For sell mode: shares owned
  cashBalance?: number; // For buy mode: available cash
  onSuccess: () => void;
}

type InputMode = "shares" | "dollars";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function TradingModal({
  isOpen,
  onClose,
  mode,
  symbol,
  companyName,
  currentPrice,
  emoji = "🏢",
  maxQuantity,
  cashBalance,
  onSuccess,
}: TradingModalProps) {
  const [inputMode, setInputMode] = useState<InputMode>("shares");
  const [quantity, setQuantity] = useState(1);
  const [dollarAmount, setDollarAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isBuy = mode === "buy";
  const maxAffordable = cashBalance ? Math.floor(cashBalance / currentPrice) : Infinity;
  const maxAllowed = isBuy ? maxAffordable : (maxQuantity || 0);

  // Calculate values based on input mode
  const calculatedQuantity = inputMode === "shares"
    ? quantity
    : Math.floor((parseFloat(dollarAmount) || 0) / currentPrice);
  const totalAmount = calculatedQuantity * currentPrice;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputMode("shares");
      setQuantity(1);
      setDollarAmount("");
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > maxAllowed) newQuantity = maxAllowed;
    setQuantity(newQuantity);
    setError("");
  };

  const handleDollarChange = (value: string) => {
    // Allow only numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;

    setDollarAmount(sanitized);
    setError("");
  };

  const handleSubmit = async () => {
    if (calculatedQuantity < 1) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = isBuy ? "/api/trading/buy" : "/api/trading/sell";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, quantity: calculatedQuantity }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.data.message);
        // Wait a bit to show success, then close
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch {
      setError("Connection error. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPicksShares = [1, 5, 10, 25].filter(n => n <= maxAllowed);
  const quickPicksDollars = isBuy
    ? [10, 25, 50, 100].filter(n => cashBalance === undefined || n <= cashBalance)
    : [10, 25, 50, 100].filter(n => maxQuantity === undefined || n <= (maxQuantity * currentPrice));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - don't allow close during trade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden">
              {/* Success State */}
              {successMessage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-7xl mb-4"
                  >
                    {isBuy ? "🎉" : "💰"}
                  </motion.div>
                  <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
                    {isBuy ? "You bought it!" : "Sold!"}
                  </h2>
                  <p className="text-[var(--text-secondary)]">{successMessage}</p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className={`p-6 ${isBuy ? "bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)]" : "bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)]"} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{emoji}</span>
                        <div>
                          <h2 className="font-display text-xl font-bold">
                            {isBuy ? "Buy" : "Sell"} {companyName}
                          </h2>
                          <p className="text-white/80 text-sm">{symbol}</p>
                        </div>
                      </div>
                      <button
                        onClick={isLoading ? undefined : onClose}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 2l10 10M12 2L2 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-white/70 text-sm">Current Price</p>
                      <p className="font-display text-3xl font-bold">{formatCurrency(currentPrice)}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-[var(--down-red-bg)] text-[var(--down-red)] text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Input Mode Toggle - Only show for buy mode */}
                    {isBuy && (
                      <div className="mb-4">
                        <div className="flex bg-[var(--cream)] rounded-xl p-1">
                          <button
                            onClick={() => setInputMode("shares")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                              inputMode === "shares"
                                ? "bg-white text-[var(--text-primary)] shadow-sm"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            By Shares
                          </button>
                          <button
                            onClick={() => setInputMode("dollars")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                              inputMode === "dollars"
                                ? "bg-white text-[var(--text-primary)] shadow-sm"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            By Dollars
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shares Input Mode */}
                    {inputMode === "shares" && (
                      <>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                            How many shares?
                          </label>
                          <div className="flex items-center justify-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(quantity - 1)}
                              disabled={quantity <= 1}
                              className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--cream)] text-[var(--text-primary)] text-2xl font-bold hover:bg-[var(--cream-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </motion.button>
                            <motion.div
                              key={quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="w-24 h-16 flex items-center justify-center bg-[var(--cream)] rounded-2xl"
                            >
                              <span className="font-display text-3xl font-bold text-[var(--text-primary)]">
                                {quantity}
                              </span>
                            </motion.div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(quantity + 1)}
                              disabled={quantity >= maxAllowed}
                              className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--cream)] text-[var(--text-primary)] text-2xl font-bold hover:bg-[var(--cream-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </motion.button>
                          </div>
                        </div>

                        {/* Quick picks for shares */}
                        {quickPicksShares.length > 1 && (
                          <div className="mb-6">
                            <p className="text-xs text-[var(--text-muted)] mb-2 text-center">Quick pick</p>
                            <div className="flex justify-center gap-2">
                              {quickPicksShares.map(n => (
                                <motion.button
                                  key={n}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleQuantityChange(n)}
                                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                    quantity === n
                                      ? isBuy
                                        ? "bg-[var(--teal)] text-white"
                                        : "bg-[var(--coral)] text-white"
                                      : "bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)]"
                                  }`}
                                >
                                  {n}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Dollars Input Mode */}
                    {inputMode === "dollars" && (
                      <>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                            How much do you want to invest?
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--text-muted)]">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={dollarAmount}
                              onChange={(e) => handleDollarChange(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-16 pl-10 pr-4 text-center font-display text-3xl font-bold text-[var(--text-primary)] bg-[var(--cream)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--teal)] placeholder:text-[var(--text-muted)]/50"
                            />
                          </div>
                          {calculatedQuantity > 0 && (
                            <p className="text-center text-sm text-[var(--text-muted)] mt-2">
                              = {calculatedQuantity} share{calculatedQuantity !== 1 ? "s" : ""}
                            </p>
                          )}
                          {parseFloat(dollarAmount) > 0 && calculatedQuantity === 0 && (
                            <p className="text-center text-sm text-[var(--coral)] mt-2">
                              Not enough to buy 1 share (min: {formatCurrency(currentPrice)})
                            </p>
                          )}
                        </div>

                        {/* Quick picks for dollars */}
                        {quickPicksDollars.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs text-[var(--text-muted)] mb-2 text-center">Quick pick</p>
                            <div className="flex justify-center gap-2">
                              {quickPicksDollars.map(n => (
                                <motion.button
                                  key={n}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setDollarAmount(n.toString())}
                                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                    dollarAmount === n.toString()
                                      ? "bg-[var(--teal)] text-white"
                                      : "bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)]"
                                  }`}
                                >
                                  ${n}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Summary */}
                    <div className="bg-[var(--cream)]/50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--text-secondary)]">
                          {isBuy ? "Total Cost" : "You'll Receive"}
                        </span>
                        <span className="font-display text-xl font-bold text-[var(--text-primary)]">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      {inputMode === "dollars" && calculatedQuantity > 0 && (
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-[var(--text-muted)]">Shares to buy</span>
                          <span className="font-semibold text-[var(--text-secondary)]">
                            {calculatedQuantity}
                          </span>
                        </div>
                      )}
                      {isBuy && cashBalance !== undefined && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--text-muted)]">Cash After</span>
                          <span className={`font-semibold ${
                            cashBalance - totalAmount < 0 ? "text-[var(--down-red)]" : "text-[var(--text-secondary)]"
                          }`}>
                            {formatCurrency(cashBalance - totalAmount)}
                          </span>
                        </div>
                      )}
                      {!isBuy && maxQuantity !== undefined && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--text-muted)]">Shares After</span>
                          <span className="font-semibold text-[var(--text-secondary)]">
                            {maxQuantity - calculatedQuantity}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-4 rounded-xl bg-[var(--cream)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--cream-dark)] transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isLoading || calculatedQuantity < 1 || calculatedQuantity > maxAllowed}
                        className={`flex-1 py-4 rounded-xl text-white font-display font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isBuy
                            ? "bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)]"
                            : "bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)]"
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              ⏳
                            </motion.span>
                            Processing...
                          </span>
                        ) : (
                          `${isBuy ? "Buy" : "Sell"} ${calculatedQuantity} Share${calculatedQuantity !== 1 ? "s" : ""}`
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
