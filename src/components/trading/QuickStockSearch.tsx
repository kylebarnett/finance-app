"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  emoji: string;
}

interface QuickStockSearchProps {
  onSelectStock: (stock: StockData) => void;
  cashBalance?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function QuickStockSearch({ onSelectStock, cashBalance }: QuickStockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data.slice(0, 5)); // Limit to 5 results
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelectResult = async (result: SearchResult) => {
    setIsLoadingStock(true);
    setShowResults(false);
    setQuery(result.symbol);

    try {
      const response = await fetch(`/api/stock?symbol=${encodeURIComponent(result.symbol)}`);
      const data = await response.json();

      if (data.success) {
        onSelectStock({
          symbol: data.data.symbol,
          name: data.data.name,
          price: data.data.price,
          change: data.data.change,
          changePercent: data.data.changePercent,
          emoji: data.data.emoji,
        });
        setQuery("");
      }
    } catch (error) {
      console.error("Stock fetch error:", error);
    } finally {
      setIsLoadingStock(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a stock to buy..."
          className="w-full px-5 py-4 pl-12 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-[var(--teal)] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all shadow-sm"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
          {isSearching || isLoadingStock ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
          ) : (
            "🔍"
          )}
        </div>
        {cashBalance !== undefined && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
            <span className="hidden sm:inline">Cash: </span>
            <span className="font-semibold text-[var(--text-secondary)]">{formatCurrency(cashBalance)}</span>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[var(--cream-dark)] overflow-hidden z-20"
          >
            {results.map((result, index) => (
              <motion.button
                key={result.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--cream)] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[var(--cream)] rounded-xl flex items-center justify-center text-lg font-bold text-[var(--text-secondary)]">
                  {result.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] truncate">
                    {result.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {result.symbol} • {result.exchange}
                  </p>
                </div>
                <span className="text-[var(--teal)] font-semibold text-sm">Buy</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
