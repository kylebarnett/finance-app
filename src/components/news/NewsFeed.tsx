"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NewsCard from "./NewsCard";
import type { NewsItem } from "@/lib/types/database";

interface NewsFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  autoScroll?: boolean;
  autoScrollInterval?: number; // in milliseconds
}

export default function NewsFeed({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  autoScroll = true,
  autoScrollInterval = 5000, // 5 seconds
}: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardWidth = 288 + 16; // card width (w-72 = 288px) + gap (gap-4 = 16px)

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news?limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setNews(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load news");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Couldn't load news right now");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchNews, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh, refreshInterval]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (scrollRef.current) {
      const scrollPosition = index * cardWidth;
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [cardWidth]);

  // Handle scroll to update current index
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, news.length - 1)));
    }
  }, [cardWidth, news.length]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!autoScroll || isPaused || news.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % news.length;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, currentIndex, isPaused, news.length, scrollToIndex]);

  // Navigation handlers
  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? news.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % news.length;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 h-48 bg-white/50 rounded-[20px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <span className="text-4xl mb-3 block">📰</span>
        <p className="text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchNews();
          }}
          className="mt-3 px-4 py-2 bg-[var(--cream)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--cream-dark)] transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Empty state
  if (news.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <span className="text-4xl mb-3 block">🤔</span>
        <p className="text-[var(--text-secondary)]">No news right now</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Check back later for the latest updates!
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      <AnimatePresence>
        {news.length > 1 && (
          <>
            {/* Left Arrow */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors -ml-2"
              aria-label="Previous news"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5l-5 5 5 5" />
              </svg>
            </motion.button>

            {/* Right Arrow */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors -mr-2"
              aria-label="Next news"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 5l5 5-5 5" />
              </svg>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ scrollSnapAlign: "start" }}
          >
            <NewsCard news={item} />
          </motion.div>
        ))}
      </div>

      {/* Dot Indicators */}
      {news.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                scrollToIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[var(--coral)] w-6"
                  : "bg-[var(--cream-dark)] hover:bg-[var(--text-muted)]"
              }`}
              aria-label={`Go to news ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-scroll indicator */}
      {autoScroll && news.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isPaused ? 0 : 0.5 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-[var(--text-muted)] flex items-center gap-1"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ●
          </motion.span>
          Auto-scrolling
        </motion.div>
      )}
    </div>
  );
}
