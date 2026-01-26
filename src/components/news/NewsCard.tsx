"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem } from "@/lib/types/database";

interface NewsCardProps {
  news: NewsItem;
  compact?: boolean;
}

export default function NewsCard({ news, compact = false }: NewsCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = () => {
    setShowPreview(true);
  };

  const handleReadMore = () => {
    setShowPreview(false);
    setShowWarning(true);
  };

  const openLink = () => {
    window.open(news.url, "_blank", "noopener,noreferrer");
    setShowWarning(false);
  };

  const sentimentColors = {
    positive: "bg-[var(--up-green-bg)] border-[var(--up-green)]/20",
    neutral: "bg-[var(--cream)] border-[var(--cream-dark)]",
    negative: "bg-[var(--down-red-bg)] border-[var(--down-red)]/20",
  };

  const sentimentLabels = {
    positive: { text: "Good News!", color: "text-[var(--up-green)]", bg: "bg-[var(--up-green-bg)]" },
    neutral: { text: "Market Update", color: "text-[var(--text-secondary)]", bg: "bg-[var(--cream)]" },
    negative: { text: "Heads Up!", color: "text-[var(--down-red)]", bg: "bg-[var(--down-red-bg)]" },
  };

  // Preview Modal Component (shared between compact and full)
  const PreviewModal = () => (
    <AnimatePresence>
      {showPreview && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[24px] shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>

            {/* Thumbnail */}
            {news.thumbnail ? (
              <div className="relative w-full h-48 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={news.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${sentimentLabels[news.sentiment].bg} ${sentimentLabels[news.sentiment].color}`}>
                    <span>{news.emoji}</span>
                    {sentimentLabels[news.sentiment].text}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`relative w-full h-32 flex-shrink-0 flex items-center justify-center ${sentimentLabels[news.sentiment].bg}`}>
                <span className="text-6xl">{news.emoji}</span>
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 ${sentimentLabels[news.sentiment].color}`}>
                    {sentimentLabels[news.sentiment].text}
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Source and time */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
                <span className="font-medium">{news.source}</span>
                <span>·</span>
                <span>{news.publishedAt}</span>
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                {news.title}
              </h3>

              {/* Sneak peek / What this means */}
              <div className="p-4 bg-[var(--cream)]/50 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-sm mb-1">
                      What&apos;s this about?
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {news.sentiment === 'positive' && "This news seems positive for the stock market! It might mean good things for investors."}
                      {news.sentiment === 'negative' && "This news might be a bit concerning for investors. Remember, markets go up and down - that's normal!"}
                      {news.sentiment === 'neutral' && "This is a regular market update. It's good to stay informed about what's happening!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related stocks */}
              {news.relatedSymbols && news.relatedSymbols.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Related stocks:</p>
                  <div className="flex flex-wrap gap-2">
                    {news.relatedSymbols.slice(0, 5).map((symbol) => (
                      <span
                        key={symbol}
                        className="px-3 py-1 bg-[var(--cream)] rounded-full text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-[var(--cream-dark)] flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleReadMore}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-semibold rounded-xl hover:shadow-md transition-shadow flex items-center justify-center gap-2"
              >
                <span>Read Full Article</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // External Link Warning Modal
  const WarningModal = () => (
    <AnimatePresence>
      {showWarning && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWarning(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[24px] shadow-2xl z-50 p-6"
          >
            <div className="text-center">
              <span className="text-5xl">🔗</span>
              <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mt-4 mb-2">
                Leaving Flynn
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                This link will take you to <strong>{news.source}</strong>.
                Ask a grown-up if you&apos;re not sure!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 px-4 py-3 bg-[var(--cream)] text-[var(--text-secondary)] font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
                >
                  Stay Here
                </button>
                <button
                  onClick={openLink}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-semibold rounded-xl hover:shadow-md transition-shadow"
                >
                  Go to Site
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (compact) {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleClick}
          className="flex items-start gap-3 p-3 bg-white/50 rounded-xl cursor-pointer hover:bg-white/80 transition-colors"
        >
          <span className="text-xl flex-shrink-0">{news.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">
              {news.title}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {news.source} · {news.publishedAt}
            </p>
          </div>
        </motion.div>

        <PreviewModal />
        <WarningModal />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`flex-shrink-0 w-72 p-4 rounded-[20px] border cursor-pointer transition-shadow hover:shadow-lg ${sentimentColors[news.sentiment]}`}
      >
        {/* Header with emoji */}
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
          >
            {news.emoji}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-muted)]">
              {news.source}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {news.publishedAt}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-[var(--text-primary)] line-clamp-3 mb-2">
          {news.title}
        </h3>

        {/* Thumbnail if available */}
        {news.thumbnail && (
          <div className="mt-3 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.thumbnail}
              alt=""
              className="w-full h-24 object-cover"
            />
          </div>
        )}

        {/* Read more hint */}
        <div className="mt-3 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span>Tap to read more</span>
          <span>→</span>
        </div>
      </motion.div>

      <PreviewModal />
      <WarningModal />
    </>
  );
}
