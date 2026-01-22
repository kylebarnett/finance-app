"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import HoldingsList from "@/components/trading/HoldingsList";
import TransactionHistory from "@/components/trading/TransactionHistory";
import TradingModal from "@/components/trading/TradingModal";
import QuickStockSearch from "@/components/trading/QuickStockSearch";
import { useAuth } from "@/components/auth/AuthProvider";

interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  companyName: string;
  emoji: string;
}

interface Transaction {
  id: string;
  symbol: string;
  transactionType: "BUY" | "SELL";
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  executedAt: string;
  companyName: string;
  emoji: string;
}

interface PortfolioData {
  summary: {
    totalValue: number;
    cashBalance: number;
    holdingsValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    startingBalance: number;
  };
  holdings: Holding[];
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  emoji: string;
}

type TabType = "holdings" | "history";

export default function PortfolioPage() {
  const { user, isLoading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("holdings");
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sellModal, setSellModal] = useState<{
    isOpen: boolean;
    holding: Holding | null;
  }>({ isOpen: false, holding: null });
  const [buyModal, setBuyModal] = useState<{
    isOpen: boolean;
    stock: StockData | null;
  }>({ isOpen: false, stock: null });

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch("/api/trading/portfolio");
      const result = await response.json();

      if (result.success) {
        setPortfolioData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, []);

  const fetchHistory = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setIsLoadingHistory(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/trading/history?limit=20&offset=${offset}`);
      const result = await response.json();

      if (result.success) {
        if (append) {
          setTransactions(prev => [...prev, ...result.data.transactions]);
        } else {
          setTransactions(result.data.transactions);
        }
        setHasMoreHistory(result.data.pagination.hasMore);
        setHistoryOffset(offset + result.data.transactions.length);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Fetch portfolio data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user, fetchPortfolio]);

  // Fetch history when tab changes to history
  useEffect(() => {
    if (user && activeTab === "history" && transactions.length === 0) {
      fetchHistory(0);
    }
  }, [user, activeTab, transactions.length, fetchHistory]);

  const handleLoadMore = () => {
    fetchHistory(historyOffset, true);
  };

  const handleSell = (holding: Holding) => {
    setSellModal({ isOpen: true, holding });
  };

  const handleSelectStock = (stock: StockData) => {
    setBuyModal({ isOpen: true, stock });
  };

  const handleTradeSuccess = () => {
    // Refresh data after a successful trade
    refreshProfile();
    fetchPortfolio();
    // Reset history to refetch
    setTransactions([]);
    setHistoryOffset(0);
    if (activeTab === "history") {
      fetchHistory(0);
    }
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
            className="bg-white/70 backdrop-blur-sm rounded-[24px] p-12 shadow-[var(--shadow-soft)] text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🔐
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-4">
              Log in to see your portfolio
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Create an account or log in to start building your practice portfolio with $10,000 in virtual money!
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

      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3"
          >
            My Portfolio 📊
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            Track your investments and see how you&apos;re doing!
          </motion.p>
        </motion.div>

        {/* Portfolio Summary */}
        <PortfolioSummary
          totalValue={portfolioData?.summary.totalValue ?? 10000}
          cashBalance={portfolioData?.summary.cashBalance ?? 10000}
          holdingsValue={portfolioData?.summary.holdingsValue ?? 0}
          totalGainLoss={portfolioData?.summary.totalGainLoss ?? 0}
          totalGainLossPercent={portfolioData?.summary.totalGainLossPercent ?? 0}
          startingBalance={portfolioData?.summary.startingBalance ?? 10000}
          isLoading={isLoadingPortfolio}
        />

        {/* Quick Stock Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span>🛒</span> Buy More Stocks
          </h3>
          <QuickStockSearch
            onSelectStock={handleSelectStock}
            cashBalance={portfolioData?.summary.cashBalance}
          />
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("holdings")}
            className={`flex-1 py-4 rounded-xl font-display font-semibold text-lg transition-all ${
              activeTab === "holdings"
                ? "bg-[var(--text-primary)] text-white shadow-lg"
                : "bg-white/70 text-[var(--text-secondary)] hover:bg-white"
            }`}
          >
            <span className="mr-2">📈</span>
            My Stocks
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 rounded-xl font-display font-semibold text-lg transition-all ${
              activeTab === "history"
                ? "bg-[var(--text-primary)] text-white shadow-lg"
                : "bg-white/70 text-[var(--text-secondary)] hover:bg-white"
            }`}
          >
            <span className="mr-2">📋</span>
            Trade History
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "holdings" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "holdings" ? (
            <HoldingsList
              holdings={portfolioData?.holdings ?? []}
              isLoading={isLoadingPortfolio}
              onSell={handleSell}
            />
          ) : (
            <TransactionHistory
              transactions={transactions}
              isLoading={isLoadingHistory}
              hasMore={hasMoreHistory}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
            />
          )}
        </motion.div>

        {/* Quick action - show only when no holdings */}
        {!isLoadingPortfolio && portfolioData && portfolioData.holdings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-[var(--text-muted)] mb-4">
              Want to explore companies first?
            </p>
            <Link href="/#learn">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Learn About Companies 🔍
              </motion.button>
            </Link>
          </motion.div>
        )}
      </section>

      <Footer />

      {/* Sell Modal */}
      {sellModal.holding && (
        <TradingModal
          isOpen={sellModal.isOpen}
          onClose={() => setSellModal({ isOpen: false, holding: null })}
          mode="sell"
          symbol={sellModal.holding.symbol}
          companyName={sellModal.holding.companyName}
          currentPrice={sellModal.holding.currentPrice}
          emoji={sellModal.holding.emoji}
          maxQuantity={sellModal.holding.quantity}
          onSuccess={handleTradeSuccess}
        />
      )}

      {/* Buy Modal */}
      {buyModal.stock && (
        <TradingModal
          isOpen={buyModal.isOpen}
          onClose={() => setBuyModal({ isOpen: false, stock: null })}
          mode="buy"
          symbol={buyModal.stock.symbol}
          companyName={buyModal.stock.name}
          currentPrice={buyModal.stock.price}
          emoji={buyModal.stock.emoji}
          cashBalance={portfolioData?.summary.cashBalance}
          onSuccess={handleTradeSuccess}
        />
      )}
    </main>
  );
}
