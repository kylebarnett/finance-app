"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Dictionary of financial terms with child-friendly explanations
const termDefinitions: Record<string, { emoji: string; simple: string; example?: string }> = {
  // Market terms
  "market cap": {
    emoji: "🏦",
    simple: "How much the whole company is worth if you added up all its tiny pieces (shares).",
    example: "If a company has 100 shares worth $10 each, its market cap is $1,000!",
  },
  "market capitalization": {
    emoji: "🏦",
    simple: "How much the whole company is worth if you added up all its tiny pieces (shares).",
    example: "If a company has 100 shares worth $10 each, its market cap is $1,000!",
  },
  stock: {
    emoji: "📄",
    simple: "A tiny piece of a company that you can own. When you buy a stock, you become a part-owner!",
    example: "Owning 1 Apple stock means you own a teeny tiny piece of Apple!",
  },
  share: {
    emoji: "📄",
    simple: "Another word for stock - one tiny piece of a company.",
    example: "If you have 10 shares, you own 10 tiny pieces of that company.",
  },
  shares: {
    emoji: "📄",
    simple: "Multiple tiny pieces of a company that people can buy and sell.",
    example: "Companies can have millions or even billions of shares!",
  },
  // Price terms
  "stock price": {
    emoji: "💵",
    simple: "How much it costs to buy one tiny piece (share) of a company right now.",
    example: "If the stock price is $150, that's what you'd pay for one share.",
  },
  price: {
    emoji: "💵",
    simple: "How much something costs. For stocks, it's what one share costs right now.",
  },
  // Volume
  volume: {
    emoji: "🔄",
    simple: "How many shares were bought and sold today - like counting how many times a trading card was swapped!",
    example: "High volume means lots of people are trading that stock today.",
  },
  // Change terms
  change: {
    emoji: "📊",
    simple: "How much the price went up or down compared to yesterday.",
    example: "If a stock was $100 yesterday and is $105 today, the change is +$5!",
  },
  "percent change": {
    emoji: "📊",
    simple: "The change shown as a percentage - it helps compare big and small stocks.",
    example: "A $5 change on a $100 stock is 5%, but on a $1000 stock it's only 0.5%.",
  },
  // Range terms
  "day range": {
    emoji: "📈",
    simple: "The lowest and highest prices the stock hit today - stocks bounce around all day!",
  },
  "52-week range": {
    emoji: "📅",
    simple: "The lowest and highest prices over the past year. Shows how much the stock moves!",
  },
  "52 week": {
    emoji: "📅",
    simple: "The past year (52 weeks). Used to see how a stock has done over time.",
  },
  // Close terms
  "previous close": {
    emoji: "🌙",
    simple: "The price when the market closed yesterday. We compare today's price to this!",
  },
  close: {
    emoji: "🌙",
    simple: "The final price when the stock market closes for the day (usually 4 PM).",
  },
  open: {
    emoji: "🌅",
    simple: "The first price when the stock market opens in the morning (usually 9:30 AM).",
  },
  // Ratios
  "p/e ratio": {
    emoji: "🎯",
    simple: "A number that helps figure out if a stock is expensive or cheap compared to how much money the company makes.",
    example: "A P/E of 20 means you're paying $20 for every $1 the company earns.",
  },
  "pe ratio": {
    emoji: "🎯",
    simple: "A number that helps figure out if a stock is expensive or cheap compared to how much money the company makes.",
    example: "A P/E of 20 means you're paying $20 for every $1 the company earns.",
  },
  // Index terms
  index: {
    emoji: "📊",
    simple: "A group of stocks bundled together to show how the market is doing overall.",
    example: "The S&P 500 is an index that tracks 500 big companies!",
  },
  "dow jones": {
    emoji: "🏭",
    simple: "An index that tracks 30 of the biggest, most important companies in America.",
    example: "Companies like Apple, McDonald's, and Disney are in the Dow!",
  },
  dow: {
    emoji: "🏭",
    simple: "Short for Dow Jones - tracks 30 of America's biggest companies.",
  },
  "s&p 500": {
    emoji: "📊",
    simple: "An index that follows 500 large companies - like a report card for the whole stock market!",
  },
  nasdaq: {
    emoji: "💻",
    simple: "An index focused on technology companies like Google, Amazon, and Apple.",
  },
  // Trading terms
  trading: {
    emoji: "🔄",
    simple: "Buying and selling stocks. When you trade, you swap money for shares or shares for money.",
  },
  investor: {
    emoji: "👤",
    simple: "Someone who buys stocks hoping they'll be worth more in the future.",
  },
  portfolio: {
    emoji: "📁",
    simple: "All the stocks and investments someone owns, collected together like a folder.",
  },
  dividend: {
    emoji: "🎁",
    simple: "Free money a company gives you just for owning their stock - like a thank you gift!",
    example: "Some companies pay dividends every 3 months to their shareholders.",
  },
  // Market mood
  "bull market": {
    emoji: "🐂",
    simple: "When stock prices keep going up and everyone is happy! Bulls push UP with their horns.",
  },
  "bear market": {
    emoji: "🐻",
    simple: "When stock prices keep going down. Bears swipe DOWN with their paws.",
  },
  bullish: {
    emoji: "🐂",
    simple: "Feeling positive that prices will go up!",
  },
  bearish: {
    emoji: "🐻",
    simple: "Feeling worried that prices might go down.",
  },
  // Revenue/earnings
  revenue: {
    emoji: "💵",
    simple: "All the money a company collects from selling their products or services.",
    example: "If Apple sells 10 iPhones for $1000 each, that's $10,000 in revenue!",
  },
  earnings: {
    emoji: "💰",
    simple: "The money a company keeps after paying all their bills - their profit!",
  },
  profit: {
    emoji: "💰",
    simple: "Money left over after a company pays for everything. Revenue minus costs!",
  },
  // Exchange
  exchange: {
    emoji: "🏛️",
    simple: "A place where people buy and sell stocks, like a marketplace for company shares.",
    example: "The New York Stock Exchange (NYSE) is the biggest exchange in the world!",
  },
  nyse: {
    emoji: "🏛️",
    simple: "New York Stock Exchange - the biggest stock marketplace in the world!",
  },
};

interface FinancialTermProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export default function FinancialTerm({ term, children, className = "" }: FinancialTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const definition = termDefinitions[term.toLowerCase()];

  // Calculate position based on available space
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow > spaceAbove || spaceAbove < 150) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!definition) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span ref={containerRef} className="relative inline">
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          inline-flex items-center gap-1
          px-1.5 py-0.5 -mx-1.5 -my-0.5
          rounded-md
          text-inherit font-inherit
          transition-all duration-200
          ${isOpen
            ? "bg-[var(--coral)]/15 text-[var(--coral-dark)]"
            : "hover:bg-[var(--coral)]/10 hover:text-[var(--coral-dark)]"
          }
          focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/30 focus:ring-offset-1
          ${className}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{children}</span>
        <span className={`
          inline-flex items-center justify-center
          w-4 h-4 text-[10px] font-bold
          rounded-full
          transition-all duration-200
          ${isOpen
            ? "bg-[var(--coral)] text-white"
            : "bg-[var(--coral)]/20 text-[var(--coral-dark)]"
          }
        `}>
          ?
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 8 : -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 8 : -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute z-50 w-72 p-4 rounded-[16px] shadow-xl border border-[var(--cream-dark)]
              left-1/2 -translate-x-1/2
              ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
            `}
            style={{ backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow */}
            <div
              className={`
                absolute left-1/2 -translate-x-1/2 w-3 h-3 border-[var(--cream-dark)]
                ${position === "top"
                  ? "bottom-0 translate-y-1/2 rotate-45 border-r border-b"
                  : "top-0 -translate-y-1/2 rotate-45 border-l border-t"
                }
              `}
              style={{ backgroundColor: "#ffffff" }}
            />

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>

            {/* Content */}
            <div className="relative pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{definition.emoji}</span>
                <span className="font-display font-semibold text-[var(--text-primary)] capitalize">
                  {term}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                {definition.simple}
              </p>

              {definition.example && (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--cream)]/50 rounded-lg p-2">
                  <span className="font-semibold">Example: </span>
                  {definition.example}
                </div>
              )}
            </div>

            {/* Tap hint for mobile */}
            <div className="mt-3 pt-2 border-t border-[var(--cream-dark)] text-[10px] text-[var(--text-muted)] text-center">
              Tap anywhere outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// Helper component for inline term highlighting
export function Term({ children }: { children: string }) {
  return <FinancialTerm term={children}>{children}</FinancialTerm>;
}
