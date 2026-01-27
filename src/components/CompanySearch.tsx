"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StockChart from "./StockChart";
import FinancialTerm from "./FinancialTerm";
import TradingModal from "./trading/TradingModal";
import AddToWatchlistButton from "./watchlist/AddToWatchlistButton";
import { useAuth } from "./auth/AuthProvider";

interface StockData {
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
  avgVolume: number;
  marketCap: number;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  exchange: string;
  currency: string;
  emoji: string;
  description: string;
  funFact: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

const popularStocks = [
  { symbol: "AAPL", name: "Apple", emoji: "🍎" },
  { symbol: "GOOGL", name: "Google", emoji: "🔍" },
  { symbol: "MSFT", name: "Microsoft", emoji: "🪟" },
  { symbol: "AMZN", name: "Amazon", emoji: "📦" },
  { symbol: "TSLA", name: "Tesla", emoji: "🚗" },
  { symbol: "DIS", name: "Disney", emoji: "🏰" },
];

function formatCurrency(num: number): string {
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLargeNumber(num: number): { value: string; unit: string; explanation: string } {
  if (!num || isNaN(num)) return { value: "N/A", unit: "", explanation: "Data not available" };

  if (num >= 1000000000000) {
    const trillions = num / 1000000000000;
    return {
      value: `$${trillions.toFixed(2)}`,
      unit: "trillion",
      explanation: `That's ${trillions.toFixed(1)} thousand billion dollars! Imagine stacking that many dollar bills - they'd reach past the moon!`,
    };
  }
  if (num >= 1000000000) {
    const billions = num / 1000000000;
    return {
      value: `$${billions.toFixed(1)}`,
      unit: "billion",
      explanation: `With that much money, you could buy about ${Math.floor(billions * 200).toLocaleString()} houses!`,
    };
  }
  if (num >= 1000000) {
    const millions = num / 1000000;
    return {
      value: `$${millions.toFixed(0)}`,
      unit: "million",
      explanation: `That's enough to buy ${Math.floor(millions * 20).toLocaleString()} brand new bicycles!`,
    };
  }
  return {
    value: `$${num.toLocaleString()}`,
    unit: "",
    explanation: "",
  };
}

function formatVolume(num: number): string {
  if (!num) return "N/A";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function CompanySearch() {
  const router = useRouter();
  const { user, paperAccount, refreshProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectStock = async (symbol: string) => {
    setIsLoading(true);
    setShowSuggestions(false);
    setError(null);
    setQuery(symbol);

    try {
      const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
      const result = await response.json();

      if (result.success && result.data) {
        setStockData(result.data);
      } else {
        setError("Couldn't find that stock. Try searching for a different company!");
        setStockData(null);
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
      setError("Something went wrong. Please try again!");
      setStockData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      if (searchResults.length > 0) {
        handleSelectStock(searchResults[0].symbol);
      } else {
        handleSelectStock(query.trim().toUpperCase());
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isUp = stockData ? stockData.change >= 0 : true;
  const marketCap = stockData ? formatLargeNumber(stockData.marketCap) : null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Learn About Any Company
        </h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Type any company name or stock symbol to see real-time prices and learn what they do -
          all explained in simple words!
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-2xl mx-auto mb-8"
      >
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search any company (Apple, Tesla, Nike...)"
            className="w-full pl-14 pr-32 py-5 text-lg bg-[var(--card-bg)]/90 border-2 border-transparent rounded-[20px] shadow-[var(--shadow-soft)] focus:outline-none focus:border-[var(--coral)] focus:shadow-[0_0_0_4px_rgba(255,127,107,0.2)] transition-all text-[var(--text-primary)]"
          />
          <button
            onClick={() => query.trim() && handleSelectStock(searchResults[0]?.symbol || query.trim().toUpperCase())}
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-[14px] hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⏳
              </motion.span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (searchResults.length > 0 || isSearching) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-[var(--card-bg-solid)] rounded-[16px] shadow-[var(--shadow-medium)] overflow-hidden"
            >
              {isSearching && searchResults.length === 0 ? (
                <div className="px-5 py-4 text-[var(--text-muted)] text-center">
                  Searching...
                </div>
              ) : (
                searchResults.slice(0, 6).map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelectStock(result.symbol)}
                    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-[var(--cream)] transition-colors text-left"
                  >
                    <span className="w-16 px-2 py-1 bg-[var(--cream-dark)] rounded text-xs font-semibold text-[var(--text-secondary)] text-center">
                      {result.symbol}
                    </span>
                    <div className="flex-1 truncate">
                      <span className="font-medium text-[var(--text-primary)]">{result.name}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{result.exchange}</span>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Pick Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        <span className="text-sm text-[var(--text-muted)] self-center mr-2">Popular:</span>
        {popularStocks.map((s, i) => (
          <motion.button
            key={s.symbol}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => handleSelectStock(s.symbol)}
            className="px-4 py-2 bg-[var(--card-bg)]/70 hover:bg-[var(--card-bg)] rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm hover:shadow-md transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>{s.emoji}</span>
            <span>{s.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <span className="text-6xl mb-4 block">🤔</span>
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Hmm, something went wrong
            </h3>
            <p className="text-[var(--text-secondary)]">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Results */}
      <AnimatePresence mode="wait">
        {stockData && !isLoading && !error && (
          <motion.div
            key={stockData.symbol}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Stock Header Card */}
            <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[28px] p-8 shadow-[var(--shadow-soft)] mb-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 bg-gradient-to-br from-[var(--cream)] to-[var(--card-bg-solid)] rounded-[14px] flex items-center justify-center text-4xl shadow-inner"
                    >
                      {stockData.emoji}
                    </motion.div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                        {stockData.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-[var(--cream-dark)] rounded-full text-sm font-semibold text-[var(--text-secondary)]">
                          {stockData.symbol}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {stockData.exchange}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Change */}
                  <div className="mb-4">
                    <div className="font-display text-4xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(stockData.price)}
                    </div>
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`
                        inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full text-sm font-semibold
                        ${isUp
                          ? 'bg-[var(--up-green-bg)] text-[var(--up-green)]'
                          : 'bg-[var(--down-red-bg)] text-[var(--down-red)]'
                        }
                      `}
                    >
                      <span className="text-lg">{isUp ? "📈" : "📉"}</span>
                      <span>
                        {isUp ? "+" : ""}{formatCurrency(stockData.change)} ({isUp ? "+" : ""}
                        {stockData.changePercent?.toFixed(2)}%)
                      </span>
                    </motion.div>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                      {isUp
                        ? "The stock went up today! More people wanted to buy it."
                        : "The stock went down today. That's normal - stocks go up and down all the time!"}
                    </p>
                  </div>

                  {/* Description */}
                  {stockData.description && (
                    <div className="mb-4">
                      <h4 className="font-display font-semibold text-[var(--text-primary)] mb-1">
                        What does {stockData.name} do?
                      </h4>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {stockData.description}
                      </p>
                    </div>
                  )}

                  {/* Fun Fact */}
                  {stockData.funFact && (
                    <div className="p-4 bg-[var(--sunny-light)]/30 rounded-[16px] flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">Fun Fact: </span>
                        <span className="text-[var(--text-secondary)]">{stockData.funFact}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Chart */}
                <div className="lg:w-[400px]">
                  <div className="bg-[var(--card-bg)]/50 rounded-[20px] p-4">
                    <h4 className="font-display font-semibold text-[var(--text-primary)] mb-3">
                      Price Chart
                    </h4>
                    <StockChart
                      symbol={stockData.symbol}
                      range="1mo"
                      height={250}
                      showControls={true}
                      isPositive={isUp}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <h4 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4 px-2">
              The Numbers Explained 💰
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Market Cap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏦</span>
                  <span className="text-sm font-medium text-[var(--text-muted)]">How much is it worth?</span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-2xl font-bold text-[var(--coral)]">
                    {marketCap?.value}
                  </span>
                  {marketCap?.unit && <span className="text-lg text-[var(--text-secondary)] ml-1">{marketCap?.unit}</span>}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  This is called the &quot;<FinancialTerm term="market cap">market cap</FinancialTerm>&quot; - it&apos;s how much ALL the pieces (<FinancialTerm term="shares">shares</FinancialTerm>) of this company are worth added together!
                </p>
              </motion.div>

              {/* Today's Range */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-sm font-medium text-[var(--text-muted)]"><FinancialTerm term="day range">Today&apos;s price range</FinancialTerm></span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-xl font-bold text-[var(--teal)]">
                    {formatCurrency(stockData.dayLow)} - {formatCurrency(stockData.dayHigh)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  The lowest and highest prices today. Stocks bounce around like a bouncy ball throughout the day!
                </p>
              </motion.div>

              {/* Volume */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔄</span>
                  <span className="text-sm font-medium text-[var(--text-muted)]">How many <FinancialTerm term="trading">traded</FinancialTerm> today?</span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-2xl font-bold text-[var(--lavender)]">
                    {formatVolume(stockData.volume)}
                  </span>
                  <span className="text-lg text-[var(--text-secondary)] ml-1">shares</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  This many <FinancialTerm term="shares">shares</FinancialTerm> changed hands today! This is called <FinancialTerm term="volume">volume</FinancialTerm> - like counting how many times a trading card was swapped.
                </p>
              </motion.div>

              {/* 52-Week Range */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📅</span>
                  <span className="text-sm font-medium text-[var(--text-muted)]"><FinancialTerm term="52-week range">This year&apos;s range</FinancialTerm></span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-xl font-bold text-[var(--sunny)]">
                    {formatCurrency(stockData.fiftyTwoWeekLow)} - {formatCurrency(stockData.fiftyTwoWeekHigh)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  The lowest and highest prices over the past year. This shows how much the price has moved!
                </p>
              </motion.div>

              {/* Previous Close */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌙</span>
                  <span className="text-sm font-medium text-[var(--text-muted)]">Yesterday&apos;s <FinancialTerm term="close">closing price</FinancialTerm></span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-2xl font-bold text-[var(--mint)]">
                    {formatCurrency(stockData.previousClose)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  This was the price when the market closed yesterday. We compare today&apos;s price to this!
                </p>
              </motion.div>

              {/* P/E Ratio */}
              {stockData.peRatio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[var(--card-bg)]/60 backdrop-blur-sm rounded-[20px] p-5 border border-[var(--cream-dark)]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-medium text-[var(--text-muted)]"><FinancialTerm term="p/e ratio">P/E Ratio</FinancialTerm></span>
                  </div>
                  <div className="mb-2">
                    <span className="font-display text-2xl font-bold text-[var(--coral)]">
                      {stockData.peRatio.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    This number helps investors know if a stock is expensive or cheap compared to how much money the company makes.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Understanding Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-6 bg-gradient-to-br from-[var(--lavender-light)]/20 to-[var(--teal-light)]/20 rounded-[24px]"
            >
              <h4 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span>🎓</span> What does this all mean?
              </h4>
              <div className="space-y-4 text-[var(--text-secondary)]">
                <p>
                  <strong className="text-[var(--text-primary)]">Think of it like trading cards:</strong> When you buy
                  a <FinancialTerm term="share">share</FinancialTerm> of {stockData.name}, you&apos;re buying a tiny piece of the company - like owning one trading
                  card from a huge collection. The <FinancialTerm term="stock price">price</FinancialTerm> goes up when lots of people want to buy that card, and down
                  when fewer people want it.
                </p>
                <p>
                  The {isUp ? "green arrow means more people wanted to buy today" : "red arrow means fewer people wanted to buy today"} than yesterday.
                  But remember - prices go up and down every day, and that&apos;s totally normal!
                </p>
              </div>
            </motion.div>

            {/* Buy Section - Only show if user is logged in */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-6 bg-gradient-to-r from-[var(--teal-light)]/30 to-[var(--mint-light)]/30 rounded-[24px] border-2 border-[var(--teal)]/20"
              >
                <h4 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <span>🛒</span> Ready to Invest?
                </h4>
                <p className="text-[var(--text-secondary)] mb-4">
                  Practice buying {stockData.name} stock with your virtual money! Remember, this is just for practice - no real money involved.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {paperAccount && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <span>💵</span>
                      <span>You have <strong className="text-[var(--text-primary)]">{formatCurrency(paperAccount.current_cash)}</strong> to invest</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTradingModal(true)}
                      className="px-8 py-4 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-display font-semibold rounded-[14px] shadow-lg hover:shadow-xl transition-all"
                    >
                      Buy {stockData.symbol}
                    </motion.button>
                    <AddToWatchlistButton
                      symbol={stockData.symbol}
                      companyName={stockData.name}
                      size="large"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trading Modal */}
      {stockData && (
        <TradingModal
          isOpen={showTradingModal}
          onClose={() => setShowTradingModal(false)}
          mode="buy"
          symbol={stockData.symbol}
          companyName={stockData.name}
          currentPrice={stockData.price}
          emoji={stockData.emoji}
          cashBalance={paperAccount?.current_cash}
          onSuccess={() => {
            refreshProfile();
            setShowTradingModal(false);
            router.push("/portfolio");
          }}
        />
      )}

    </section>
  );
}
