"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NewsCard from "./NewsCard";
import type { NewsItem } from "@/lib/types/database";

interface StockNewsPreviewProps {
  symbol: string;
  companyName?: string;
  limit?: number;
}

export default function StockNewsPreview({
  symbol,
  companyName,
  limit = 3,
}: StockNewsPreviewProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/news/${symbol}?limit=${limit}`);
        const result = await response.json();

        if (result.success) {
          setNews(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to load news");
        }
      } catch (err) {
        console.error(`Error fetching news for ${symbol}:`, err);
        setError("Couldn't load news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [symbol, limit]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📰</span>
          <span className="font-semibold text-[var(--text-primary)]">
            Recent News
          </span>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-white/30 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state - show nothing, don't break the modal
  if (error) {
    return null;
  }

  // No news state
  if (news.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-[var(--cream)]/50 rounded-[16px]"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📰</span>
          <span className="font-semibold text-[var(--text-primary)]">
            Recent News
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          No recent news about {companyName || symbol}. Check back later!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📰</span>
        <span className="font-semibold text-[var(--text-primary)]">
          Recent News about {companyName || symbol}
        </span>
      </div>
      <div className="space-y-2">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NewsCard news={item} compact />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
