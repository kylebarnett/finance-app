"use client";

import { motion } from "framer-motion";

const floatingIcons = [
  { emoji: "📈", x: "10%", y: "20%", delay: 0 },
  { emoji: "💵", x: "85%", y: "15%", delay: 0.5 },
  { emoji: "🏦", x: "5%", y: "70%", delay: 1 },
  { emoji: "📊", x: "90%", y: "65%", delay: 1.5 },
  { emoji: "💎", x: "15%", y: "45%", delay: 0.8 },
  { emoji: "🪙", x: "80%", y: "40%", delay: 1.2 },
];

export default function Hero() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 py-16 md:py-24 overflow-visible">
      {/* Floating decorative icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: icon.delay, duration: 0.5 }}
          className="absolute text-3xl md:text-4xl pointer-events-none hidden md:block"
          style={{ left: icon.x, top: icon.y }}
        >
          <motion.span
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="block"
          >
            {icon.emoji}
          </motion.span>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight"
        >
          Money Stuff,{" "}
          <span className="relative">
            <span className="relative z-10 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] bg-clip-text text-transparent">
              Made Simple
            </span>
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-2 left-0 w-full h-4 z-0"
              viewBox="0 0 200 20"
              fill="none"
            >
              <motion.path
                d="M2 15 Q 50 5, 100 12 T 198 8"
                stroke="var(--sunny)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </motion.svg>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Ever wondered how the stock market works? Or what makes a company valuable?
          We explain it all so clearly that even a 10-year-old can understand!
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#markets"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold text-lg rounded-full shadow-[var(--shadow-glow-coral)] hover:shadow-[0_8px_30px_rgba(255,127,107,0.5)] transition-shadow flex items-center gap-2"
          >
            <span>See Live Markets</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>

          <motion.a
            href="#learn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[var(--card-bg)] backdrop-blur-sm text-[var(--text-primary)] font-display font-semibold text-lg rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Search Companies</span>
          </motion.a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span>Simple explanations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span>Kid-friendly</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span>Live updates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🆓</span>
            <span>100% free</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--coral-light)] opacity-20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[var(--teal-light)] opacity-15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--sunny-light)] opacity-15 rounded-full blur-[90px] pointer-events-none" />
    </section>
  );
}
