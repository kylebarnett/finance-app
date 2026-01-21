"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StockChart from "./StockChart";
import FinancialTerm from "./FinancialTerm";

interface MarketIndex {
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  error?: boolean;
}

interface IndexMeta {
  symbol: string;
  emoji: string;
  color: string;
  description: string;
}

const indexMeta: Record<string, IndexMeta> = {
  "^DJI": {
    symbol: "^DJI",
    emoji: "🏭",
    color: "coral",
    description: "Tracks 30 of the biggest companies in America, like Apple and McDonald's! It's one of the oldest ways to measure how the stock market is doing.",
  },
  "^GSPC": {
    symbol: "^GSPC",
    emoji: "📊",
    color: "teal",
    description: "Follows 500 large companies - it's like a report card for the whole market! Most experts think this is the best way to see how stocks are doing overall.",
  },
  "^IXIC": {
    symbol: "^IXIC",
    emoji: "💻",
    color: "lavender",
    description: "Home to tech giants like Google, Amazon, and Netflix! If you love technology, this is the index to watch.",
  },
};

function formatNumber(num: number): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatVolume(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getMoodEmoji(changePercent: number): { emoji: string; label: string } {
  if (changePercent > 2) return { emoji: "🚀", label: "To the moon!" };
  if (changePercent > 1) return { emoji: "🎉", label: "Party time!" };
  if (changePercent > 0.5) return { emoji: "😄", label: "Super happy!" };
  if (changePercent > 0) return { emoji: "🙂", label: "Feeling good!" };
  if (changePercent > -0.5) return { emoji: "😐", label: "Meh..." };
  if (changePercent > -1) return { emoji: "😕", label: "A little sad" };
  if (changePercent > -2) return { emoji: "😟", label: "Uh oh..." };
  return { emoji: "😰", label: "Rough day!" };
}

// Playful bounce animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotate: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  }),
  hover: {
    scale: 1.03,
    rotate: [0, -1, 1, -1, 0],
    transition: {
      rotate: { duration: 0.5, ease: "easeInOut" },
      scale: { type: "spring", stiffness: 400 },
    },
  },
  tap: { scale: 0.97 },
};

const emojiVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 2, repeat: Infinity, repeatDelay: 3 },
  },
};

const numberVariants = {
  initial: { scale: 1 },
  update: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const moodVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
  bounce: {
    y: [0, -10, 0],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 2 },
  },
};

// Sparkle component for positive days
function Sparkles({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

export default function MarketDashboard() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch("/api/market");
      const result = await response.json();

      if (result.success && result.data) {
        setIndices(result.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError("Unable to fetch market data");
      }
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError("Connection error - retrying...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const overallChange = indices.length > 0
    ? indices.reduce((sum, i) => sum + (i.changePercent || 0), 0) / indices.length
    : 0;
  const marketMood = getMoodEmoji(overallChange);

  if (isLoading && indices.length === 0) {
    return (
      <section className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4"
          >
            How is the Market Feeling Today?
          </motion.h2>
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 0.5, repeat: Infinity },
              }}
              className="text-5xl"
            >
              ⏳
            </motion.div>
            <span className="text-lg text-[var(--text-secondary)]">Loading the fun stuff...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/50 rounded-[24px] p-6 h-[280px] shimmer"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header with overall market mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-4"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="relative flex h-3 w-3"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </motion.span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Live Data • Updated {lastUpdate.toLocaleTimeString()}
          </span>
          {error && (
            <span className="text-xs text-[var(--down-red)]">{error}</span>
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4"
        >
          How is the Market Feeling Today?
        </motion.h2>

        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            key={marketMood.emoji}
            variants={moodVariants}
            initial="initial"
            animate={["animate", "bounce"]}
            className="text-6xl"
          >
            {marketMood.emoji}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-xl font-display font-semibold text-[var(--text-secondary)]"
          >
            {marketMood.label}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Market Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indices.map((index, i) => {
          const meta = indexMeta[index.symbol] || {
            emoji: "📈",
            color: "coral",
            description: "A stock market index.",
          };
          const isUp = index.change >= 0;
          const mood = getMoodEmoji(index.changePercent);
          const isSelected = selectedIndex === index.symbol;

          return (
            <motion.div
              key={index.symbol}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setSelectedIndex(isSelected ? null : index.symbol)}
              className={`
                relative overflow-hidden cursor-pointer
                bg-white/70 backdrop-blur-sm rounded-[24px] p-6
                border-3 transition-colors duration-300
                ${isSelected
                  ? `border-[var(--${meta.color})] shadow-xl`
                  : 'border-transparent shadow-[var(--shadow-soft)]'
                }
              `}
            >
              {/* Sparkles for good days */}
              <Sparkles isActive={isUp && index.changePercent > 0.5} />

              {/* Decorative background gradient */}
              <motion.div
                className="absolute inset-0 opacity-10 pointer-events-none"
                animate={{
                  background: [
                    `radial-gradient(circle at 80% 20%, var(--${meta.color}) 0%, transparent 50%)`,
                    `radial-gradient(circle at 20% 80%, var(--${meta.color}) 0%, transparent 50%)`,
                    `radial-gradient(circle at 80% 20%, var(--${meta.color}) 0%, transparent 50%)`,
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              {/* Top row: emoji and mood */}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <motion.span
                  variants={emojiVariants}
                  initial="initial"
                  animate="animate"
                  className="text-5xl"
                >
                  {meta.emoji}
                </motion.span>
                <motion.div
                  key={mood.emoji + index.changePercent}
                  variants={moodVariants}
                  initial="initial"
                  animate={["animate", "bounce"]}
                  className="flex flex-col items-end"
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-[var(--text-muted)] mt-1 font-medium"
                  >
                    {mood.label}
                  </motion.span>
                </motion.div>
              </div>

              {/* Index name and full name */}
              <div className="mb-3 relative z-10">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="font-display text-2xl font-bold text-[var(--text-primary)]"
                >
                  {index.name}
                </motion.h3>
                <p className="text-xs text-[var(--text-muted)]">{index.fullName}</p>
              </div>

              {/* Value display */}
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index.price}
                    variants={numberVariants}
                    initial="initial"
                    animate="update"
                    className="font-display text-4xl font-bold text-[var(--text-primary)] mb-2"
                  >
                    {formatNumber(index.price)}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    key={index.change}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`
                      flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-bold
                      ${isUp
                        ? 'bg-[var(--up-green-bg)] text-[var(--up-green)]'
                        : 'bg-[var(--down-red-bg)] text-[var(--down-red)]'
                      }
                    `}
                  >
                    <motion.span
                      animate={isUp ? { y: [0, -3, 0] } : { y: [0, 3, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                      className="text-lg"
                    >
                      {isUp ? "↑" : "↓"}
                    </motion.span>
                    <span>{isUp ? "+" : ""}{formatNumber(index.change)}</span>
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-bold ${isUp ? 'text-[var(--up-green)]' : 'text-[var(--down-red)]'}`}
                  >
                    ({isUp ? "+" : ""}{index.changePercent?.toFixed(2) || "0.00"}%)
                  </motion.span>
                </div>

                {/* Mini Chart */}
                <div className="h-[80px] -mx-2">
                  <StockChart
                    symbol={index.symbol}
                    range="1d"
                    height={80}
                    showControls={false}
                    isPositive={isUp}
                    compact={true}
                  />
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4"
                      >
                        <span className="font-semibold text-[var(--text-primary)]">What is this? </span>
                        {meta.description}
                      </motion.p>

                      {/* Today's stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: "Today's Range", term: "day range", value: `${formatNumber(index.dayLow)} - ${formatNumber(index.dayHigh)}` },
                          { label: "Volume", term: "volume", value: formatVolume(index.volume) },
                          { label: "Open", term: "open", value: formatNumber(index.open) },
                          { label: "Prev Close", term: "previous close", value: formatNumber(index.previousClose) },
                        ].map((stat, statIndex) => (
                          <motion.div
                            key={stat.term}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + statIndex * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/50 rounded-xl p-3"
                          >
                            <div className="text-[var(--text-muted)] text-xs">
                              <FinancialTerm term={stat.term}>{stat.label}</FinancialTerm>
                            </div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {stat.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Full chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4"
                      >
                        <StockChart
                          symbol={index.symbol}
                          range="1d"
                          height={200}
                          showControls={true}
                          isPositive={isUp}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click hint with bounce */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-2 right-4 text-xs text-[var(--text-muted)] opacity-70 z-10 font-medium"
              >
                {isSelected ? "Tap to close ↑" : "Tap to explore! 👆"}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
