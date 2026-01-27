"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Term {
  word: string;
  emoji: string;
  simple: string;
  example: string;
  color: string;
}

const glossaryTerms: Term[] = [
  {
    word: "Stock",
    emoji: "📄",
    simple: "A tiny piece of a company that you can own. When you buy a stock, you become a part-owner!",
    example: "If Apple has 1000 stocks and you buy 1, you own 1/1000th of Apple!",
    color: "coral",
  },
  {
    word: "Market",
    emoji: "🏪",
    simple: "A place where people buy and sell stocks, kind of like a store for company pieces.",
    example: "The New York Stock Exchange is like a giant market where people trade stocks!",
    color: "teal",
  },
  {
    word: "Dividend",
    emoji: "🎁",
    simple: "Free money a company gives you just for owning their stock - like a thank you gift!",
    example: "If you own 10 shares and the company pays $1 dividend per share, you get $10!",
    color: "sunny",
  },
  {
    word: "Portfolio",
    emoji: "📁",
    simple: "A collection of all the stocks and investments you own, like a folder of your money stuff.",
    example: "Your portfolio might have some Apple stocks, some Disney stocks, and some savings!",
    color: "lavender",
  },
  {
    word: "Bull Market",
    emoji: "🐂",
    simple: "When stock prices keep going up and everyone is happy and buying! Bulls push UP with their horns.",
    example: "In a bull market, your $100 investment might grow to $120 or more!",
    color: "up-green",
  },
  {
    word: "Bear Market",
    emoji: "🐻",
    simple: "When stock prices keep going down. Bears swipe DOWN with their paws.",
    example: "In a bear market, stocks are on sale - but people feel worried!",
    color: "down-red",
  },
  {
    word: "Interest",
    emoji: "🌱",
    simple: "Extra money that grows on your savings, like a plant growing from a seed!",
    example: "If you put $100 in a savings account with 5% interest, you'll have $105 after a year!",
    color: "mint",
  },
  {
    word: "Investment",
    emoji: "🌳",
    simple: "Using your money to hopefully make more money in the future, like planting a seed to grow a tree.",
    example: "Buying a stock is an investment because you hope it grows in value!",
    color: "teal",
  },
];

export default function Glossary() {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  return (
    <section id="glossary" className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="inline-block text-5xl mb-4"
        >
          📖
        </motion.span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Money Words Dictionary
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Financial words can sound confusing, but they're actually pretty simple!
          Click on any word to learn what it really means.
        </p>
      </motion.div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {glossaryTerms.map((term, i) => {
          const isExpanded = expandedTerm === term.word;

          return (
            <motion.div
              key={term.word}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setExpandedTerm(isExpanded ? null : term.word)}
              className={`
                cursor-pointer bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-5
                border-2 transition-all duration-300
                ${isExpanded
                  ? `border-[var(--${term.color})] shadow-lg`
                  : 'border-transparent shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)]'
                }
                hover:scale-[1.02]
              `}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <motion.span
                  animate={isExpanded ? { rotate: [0, -10, 10, 0] } : {}}
                  className="text-3xl"
                >
                  {term.emoji}
                </motion.span>
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  {term.word}
                </h3>
              </div>

              {/* Simple definition - always visible */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {term.simple}
              </p>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-4 pt-4 border-t border-[var(--cream-dark)]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div>
                          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                            Example:
                          </span>
                          <p className="text-sm text-[var(--text-primary)] mt-1">
                            {term.example}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click hint */}
              <div className="mt-3 text-xs text-[var(--text-muted)] text-right">
                {isExpanded ? "Click to close" : "Click to see example"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)]/50 rounded-full text-sm text-[var(--text-secondary)]">
          <span className="text-lg">🧠</span>
          <span>Learning these words helps you understand money better!</span>
        </div>
      </motion.div>
    </section>
  );
}
