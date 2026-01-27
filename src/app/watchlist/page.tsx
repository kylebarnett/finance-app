"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WatchlistCard from "@/components/watchlist/WatchlistCard";
import WatchlistSearch from "@/components/watchlist/WatchlistSearch";
import StockDetailModal from "@/components/watchlist/StockDetailModal";
import TradingModal from "@/components/trading/TradingModal";
import { useAuth } from "@/components/auth/AuthProvider";

interface WatchlistItem {
  id: string;
  symbol: string;
  company_name: string;
  current_price: number;
  change: number;
  change_percent: number;
  emoji: string;
}

export default function WatchlistPage() {
  const { user, isLoading: authLoading, paperAccount, refreshProfile } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyModal, setBuyModal] = useState<{
    isOpen: boolean;
    stock: WatchlistItem | null;
  }>({ isOpen: false, stock: null });
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    stock: WatchlistItem | null;
  }>({ isOpen: false, stock: null });

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch("/api/watchlist");
      const result = await response.json();

      if (result.success) {
        setWatchlist(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, fetchWatchlist]);

  const handleRemove = async (symbol: string) => {
    try {
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  const handleBuy = (stock: WatchlistItem) => {
    setBuyModal({ isOpen: true, stock });
  };

  const handleViewDetails = (stock: WatchlistItem) => {
    setDetailModal({ isOpen: true, stock });
  };

  const handleBuyFromDetail = () => {
    if (detailModal.stock) {
      setDetailModal({ isOpen: false, stock: null });
      setBuyModal({ isOpen: true, stock: detailModal.stock });
    }
  };

  const handleTradeSuccess = () => {
    refreshProfile();
    setBuyModal({ isOpen: false, stock: null });
  };

  const handleAddStock = (stock: { symbol: string; name: string; price: number; change: number; changePercent: number; emoji: string }) => {
    // Add the new stock to the watchlist state
    setWatchlist(prev => [...prev, {
      id: `temp-${stock.symbol}`,
      symbol: stock.symbol,
      company_name: stock.name,
      current_price: stock.price,
      change: stock.change,
      change_percent: stock.changePercent,
      emoji: stock.emoji,
    }]);
  };

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="w-full max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🔐
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
              Log in to see your watchlist
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Create an account or log in to start tracking your favorite stocks!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-[var(--cream)] text-[var(--text-primary)] font-display font-semibold rounded-xl hover:bg-[var(--cream-dark)] transition-colors"
                >
                  Log In
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Sign Up Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3"
          >
            My Watchlist ❤️
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            Keep track of stocks you&apos;re interested in!
          </motion.p>
        </motion.div>

        {/* Search Component */}
        <WatchlistSearch
          onAdd={handleAddStock}
          existingSymbols={watchlist.map(item => item.symbol)}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--cream)] rounded-xl"></div>
                    <div>
                      <div className="h-4 bg-[var(--cream)] rounded w-32 mb-2"></div>
                      <div className="h-3 bg-[var(--cream)] rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-[var(--cream)] rounded w-20 mb-1"></div>
                    <div className="h-3 bg-[var(--cream)] rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && watchlist.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⭐
            </motion.div>
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
              Your watchlist is empty!
            </h3>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              Use the search box above to find stocks and add them to your watchlist.
            </p>
          </motion.div>
        )}

        {/* Watchlist Items */}
        {!isLoading && watchlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {watchlist.map((item) => (
                <WatchlistCard
                  key={item.symbol}
                  symbol={item.symbol}
                  companyName={item.company_name}
                  currentPrice={item.current_price}
                  change={item.change}
                  changePercent={item.change_percent}
                  emoji={item.emoji}
                  onBuy={() => handleBuy(item)}
                  onRemove={() => handleRemove(item.symbol)}
                  onViewDetails={() => handleViewDetails(item)}
                />
              ))}
            </AnimatePresence>

            {/* Watchlist count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-6"
            >
              <p className="text-[var(--text-muted)]">
                {watchlist.length}/20 stocks on your watchlist
              </p>
            </motion.div>
          </motion.div>
        )}
      </section>

      <Footer />

      {/* Stock Detail Modal */}
      <StockDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, stock: null })}
        symbol={detailModal.stock?.symbol || ""}
        onBuy={handleBuyFromDetail}
      />

      {/* Buy Modal */}
      {buyModal.stock && (
        <TradingModal
          isOpen={buyModal.isOpen}
          onClose={() => setBuyModal({ isOpen: false, stock: null })}
          mode="buy"
          symbol={buyModal.stock.symbol}
          companyName={buyModal.stock.company_name}
          currentPrice={buyModal.stock.current_price}
          emoji={buyModal.stock.emoji}
          cashBalance={paperAccount?.current_cash}
          onSuccess={handleTradeSuccess}
        />
      )}
    </main>
  );
}
