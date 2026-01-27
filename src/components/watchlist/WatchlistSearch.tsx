"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StockDetailModal from "./StockDetailModal";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface StockPreview {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  emoji: string;
}

interface WatchlistSearchProps {
  onAdd: (stock: StockPreview) => void;
  existingSymbols: string[];
}

const popularStocks = [
  { symbol: "AAPL", name: "Apple", emoji: "🍎" },
  { symbol: "GOOGL", name: "Google", emoji: "🔍" },
  { symbol: "MSFT", name: "Microsoft", emoji: "🪟" },
  { symbol: "TSLA", name: "Tesla", emoji: "🚗" },
  { symbol: "DIS", name: "Disney", emoji: "🏰" },
  { symbol: "NFLX", name: "Netflix", emoji: "🎬" },
];

export default function WatchlistSearch({ onAdd, existingSymbols }: WatchlistSearchProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockPreview | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
    setIsLoadingStock(true);
    setShowSuggestions(false);
    setQuery("");
    setSelectedStock(null);

    try {
      const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
      const result = await response.json();

      if (result.success && result.data) {
        setSelectedStock({
          symbol: result.data.symbol,
          name: result.data.name,
          price: result.data.price,
          change: result.data.change,
          changePercent: result.data.changePercent,
          emoji: result.data.emoji,
        });
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedStock) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          company_name: selectedStock.name,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAddSuccess(true);
        setShowDetailModal(false);
        onAdd(selectedStock);
        setTimeout(() => {
          setSelectedStock(null);
          setAddSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewDetails = () => {
    if (selectedStock) {
      setShowDetailModal(true);
    }
  };

  const handleAddFromDetail = () => {
    handleAddToWatchlist();
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

  const isUp = selectedStock ? selectedStock.change >= 0 : true;
  const alreadyInWatchlist = selectedStock && existingSymbols.includes(selectedStock.symbol);

  return (
    <div className="mb-8">
      {/* Search Box */}
      <div className="relative max-w-xl mx-auto">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedStock(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search stocks to add..."
            className="w-full pl-12 pr-4 py-4 text-base bg-[var(--card-bg-solid)] border-2 border-transparent rounded-2xl shadow-[var(--shadow-soft)] focus:outline-none focus:border-[var(--teal)] focus:shadow-[0_0_0_4px_rgba(75,192,192,0.2)] transition-all text-[var(--text-primary)]"
          />
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && (searchResults.length > 0 || isSearching) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-[var(--card-bg-solid)] rounded-2xl shadow-lg overflow-hidden"
            >
              {isSearching && searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[var(--text-muted)] text-center text-sm">
                  Searching...
                </div>
              ) : (
                searchResults.slice(0, 5).map((result) => {
                  const isInList = existingSymbols.includes(result.symbol);
                  return (
                    <button
                      key={result.symbol}
                      onClick={() => !isInList && handleSelectStock(result.symbol)}
                      disabled={isInList}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                        isInList
                          ? "bg-[var(--cream)]/50 cursor-not-allowed"
                          : "hover:bg-[var(--cream)]"
                      }`}
                    >
                      <span className="w-14 px-2 py-1 bg-[var(--cream-dark)] rounded text-xs font-semibold text-[var(--text-secondary)] text-center">
                        {result.symbol}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                        {result.name}
                      </span>
                      {isInList && (
                        <span className="text-xs text-[var(--teal)] font-medium">In list</span>
                      )}
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Pick Popular Stocks */}
      {!selectedStock && !isLoadingStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          <span className="text-xs text-[var(--text-muted)] self-center mr-1">Quick add:</span>
          {popularStocks.map((s) => {
            const isInList = existingSymbols.includes(s.symbol);
            return (
              <motion.button
                key={s.symbol}
                whileHover={!isInList ? { scale: 1.05 } : {}}
                whileTap={!isInList ? { scale: 0.95 } : {}}
                onClick={() => !isInList && handleSelectStock(s.symbol)}
                disabled={isInList}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 ${
                  isInList
                    ? "bg-[var(--cream)]/50 text-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--card-bg)] hover:bg-[var(--cream)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:shadow-md"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.name}</span>
                {isInList && <span className="text-[var(--teal)]">✓</span>}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoadingStock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-[var(--card-bg)] rounded-2xl text-center"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block text-2xl"
          >
            ⏳
          </motion.span>
          <p className="text-sm text-[var(--text-muted)] mt-2">Loading stock info...</p>
        </motion.div>
      )}

      {/* Stock Preview Card */}
      <AnimatePresence>
        {selectedStock && !isLoadingStock && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-4 p-5 bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl shadow-[var(--shadow-soft)]"
          >
            {addSuccess ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center py-4"
              >
                <span className="text-4xl">✅</span>
                <p className="text-[var(--teal)] font-semibold mt-2">
                  Added {selectedStock.symbol} to your watchlist!
                </p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--cream)] to-white rounded-xl flex items-center justify-center text-2xl shadow-inner">
                    {selectedStock.emoji}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[var(--text-primary)]">
                      {selectedStock.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--text-muted)]">{selectedStock.symbol}</span>
                      <span className="text-lg font-semibold text-[var(--text-primary)]">
                        ${selectedStock.price.toFixed(2)}
                      </span>
                      <span className={`text-sm font-medium ${isUp ? "text-[var(--up-green)]" : "text-[var(--down-red)]"}`}>
                        {isUp ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alreadyInWatchlist ? (
                    <span className="px-4 py-2 bg-[var(--cream)] text-[var(--text-muted)] rounded-xl text-sm font-medium">
                      Already in watchlist
                    </span>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewDetails}
                        className="px-4 py-2.5 bg-[var(--cream)] hover:bg-[var(--cream-dark)] text-[var(--text-primary)] font-semibold rounded-xl transition-colors"
                      >
                        View Details
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToWatchlist}
                        disabled={isAdding}
                        className="px-5 py-2.5 bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isAdding ? "Adding..." : "+ Add"}
                      </motion.button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedStock(null)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Detail Modal */}
      <StockDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        symbol={selectedStock?.symbol || ""}
        onBuy={handleAddFromDetail}
        actionLabel="+ Add to Watchlist"
      />
    </div>
  );
}
