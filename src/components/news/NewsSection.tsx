"use client";

import { motion } from "framer-motion";
import NewsFeed from "./NewsFeed";

export default function NewsSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl"
            >
              📰
            </motion.div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                What&apos;s Happening Today?
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                The latest news from the stock market
              </p>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <NewsFeed limit={8} autoRefresh={true} />

        {/* Educational tip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-[var(--sunny-light)]/30 rounded-[16px] flex items-start gap-3"
        >
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Did you know?
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              News can affect stock prices! Good news often makes prices go up,
              while bad news can make them go down. That&apos;s why investors pay
              attention to the news.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
