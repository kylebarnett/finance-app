"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MarketIndex {
  name: string;
  fullName: string;
  value: number;
  change: number;
  changePercent: number;
  emoji: string;
  color: string;
  description: string;
}

const initialIndices: MarketIndex[] = [
  {
    name: "DOW",
    fullName: "Dow Jones Industrial Average",
    value: 43850.25,
    change: 125.50,
    changePercent: 0.29,
    emoji: "🏭",
    color: "coral",
    description: "Tracks 30 of the biggest companies in America, like Apple and McDonald's!",
  },
  {
    name: "S&P 500",
    fullName: "Standard & Poor's 500",
    value: 5925.75,
    change: 18.30,
    changePercent: 0.31,
    emoji: "📊",
    color: "teal",
    description: "Follows 500 large companies - it's like a report card for the whole market!",
  },
  {
    name: "NASDAQ",
    fullName: "NASDAQ Composite",
    value: 18750.80,
    change: -42.15,
    changePercent: -0.22,
    emoji: "💻",
    color: "lavender",
    description: "Home to tech giants like Google, Amazon, and Netflix!",
  },
];

function formatNumber(num: number): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getMoodEmoji(changePercent: number): { emoji: string; label: string } {
  if (changePercent > 1) return { emoji: "🚀", label: "Soaring!" };
  if (changePercent > 0.5) return { emoji: "😄", label: "Happy" };
  if (changePercent > 0) return { emoji: "🙂", label: "Good" };
  if (changePercent > -0.5) return { emoji: "😐", label: "Okay" };
  if (changePercent > -1) return { emoji: "😕", label: "Not great" };
  return { emoji: "😟", label: "Worried" };
}

export default function MarketDashboard() {
  const [indices, setIndices] = useState<MarketIndex[]>(initialIndices);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  const simulateMarketUpdate = useCallback(() => {
    setIndices((prev) =>
      prev.map((index) => {
        const volatility = 0.001 + Math.random() * 0.002;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const changeAmount = index.value * volatility * direction;
        const newValue = index.value + changeAmount;
        const newChange = index.change + changeAmount;
        const newChangePercent = (newChange / (newValue - newChange)) * 100;

        return {
          ...index,
          value: newValue,
          change: newChange,
          changePercent: newChangePercent,
        };
      })
    );
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(simulateMarketUpdate, 3000);
    return () => clearInterval(interval);
  }, [isLive, simulateMarketUpdate]);

  const overallMood = indices.reduce((sum, i) => sum + i.changePercent, 0) / indices.length;
  const marketMood = getMoodEmoji(overallMood);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header with overall market mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-4">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {isLive ? "Live Updates" : "Paused"} • Updated {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-xs px-3 py-1 rounded-full bg-[var(--cream-dark)] hover:bg-[var(--coral-light)] transition-colors"
          >
            {isLive ? "Pause" : "Resume"}
          </button>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          How is the Market Feeling Today?
        </h2>
        <div className="flex items-center justify-center gap-3">
          <motion.span
            key={marketMood.emoji}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl"
          >
            {marketMood.emoji}
          </motion.span>
          <span className="text-lg text-[var(--text-secondary)]">{marketMood.label}</span>
        </div>
      </motion.div>

      {/* Market Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indices.map((index, i) => {
          const isUp = index.change >= 0;
          const mood = getMoodEmoji(index.changePercent);
          const isSelected = selectedIndex === index.name;

          return (
            <motion.div
              key={index.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedIndex(isSelected ? null : index.name)}
              className={`
                relative overflow-hidden cursor-pointer
                bg-white/70 backdrop-blur-sm rounded-[24px] p-6
                border-2 transition-all duration-300
                ${isSelected
                  ? `border-[var(--${index.color})] shadow-lg`
                  : 'border-transparent shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)]'
                }
                hover:scale-[1.02]
              `}
            >
              {/* Decorative background gradient */}
              <div
                className={`absolute inset-0 opacity-10 pointer-events-none`}
                style={{
                  background: `radial-gradient(circle at 80% 20%, var(--${index.color}) 0%, transparent 50%)`,
                }}
              />

              {/* Top row: emoji and mood */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-4xl">{index.emoji}</span>
                <motion.div
                  key={mood.emoji + index.changePercent}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-end"
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs text-[var(--text-muted)] mt-1">{mood.label}</span>
                </motion.div>
              </div>

              {/* Index name and full name */}
              <div className="mb-4 relative z-10">
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                  {index.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{index.fullName}</p>
              </div>

              {/* Value display */}
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index.value}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2"
                  >
                    {formatNumber(index.value)}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <motion.div
                    key={index.change}
                    initial={{ x: isUp ? 10 : -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold
                      ${isUp
                        ? 'bg-[var(--up-green-bg)] text-[var(--up-green)]'
                        : 'bg-[var(--down-red-bg)] text-[var(--down-red)]'
                      }
                    `}
                  >
                    <span className="text-lg">{isUp ? "↑" : "↓"}</span>
                    <span>{isUp ? "+" : ""}{formatNumber(index.change)}</span>
                  </motion.div>

                  <span className={`text-sm font-medium ${isUp ? 'text-[var(--up-green)]' : 'text-[var(--down-red)]'}`}>
                    ({isUp ? "+" : ""}{index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Expanded description */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        <span className="font-semibold text-[var(--text-primary)]">What is this? </span>
                        {index.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click hint */}
              <div className="absolute bottom-2 right-4 text-xs text-[var(--text-muted)] opacity-60">
                {isSelected ? "Click to close" : "Click to learn more"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fun fact ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 overflow-hidden rounded-full bg-white/50 backdrop-blur-sm py-3"
      >
        <div className="animate-ticker whitespace-nowrap">
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            💡 <strong>Fun Fact:</strong> The stock market is like a giant store where people buy and sell tiny pieces of companies!
          </span>
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            🎯 <strong>Did you know?</strong> When you buy a stock, you become a part-owner of that company!
          </span>
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            📈 <strong>Tip:</strong> Green means the price went up, red means it went down - just like traffic lights!
          </span>
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            🏦 <strong>Cool fact:</strong> The New York Stock Exchange has been around since 1792 - that's older than most countries!
          </span>
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            💡 <strong>Fun Fact:</strong> The stock market is like a giant store where people buy and sell tiny pieces of companies!
          </span>
          <span className="inline-block px-8 text-[var(--text-secondary)]">
            🎯 <strong>Did you know?</strong> When you buy a stock, you become a part-owner of that company!
          </span>
        </div>
      </motion.div>
    </section>
  );
}
