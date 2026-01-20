"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CompanyData {
  symbol: string;
  name: string;
  logo: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  revenue: number;
  employees: number;
  founded: number;
  ceo: string;
  industry: string;
  description: string;
  funFact: string;
}

// Simulated company database with child-friendly data
const companyDatabase: Record<string, CompanyData> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple",
    logo: "🍎",
    price: 185.92,
    change: 2.45,
    changePercent: 1.33,
    marketCap: 2870000000000,
    revenue: 383000000000,
    employees: 164000,
    founded: 1976,
    ceo: "Tim Cook",
    industry: "Technology",
    description: "Apple makes iPhones, iPads, Mac computers, and the Apple Watch. They also have a TV streaming service and make those cool AirPods!",
    funFact: "Apple started in a garage! Steve Jobs and his friends built the first Apple computer there.",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Google (Alphabet)",
    logo: "🔍",
    price: 141.80,
    change: -1.20,
    changePercent: -0.84,
    marketCap: 1780000000000,
    revenue: 307000000000,
    employees: 182000,
    founded: 1998,
    ceo: "Sundar Pichai",
    industry: "Technology",
    description: "Google is the world's most popular search engine! They also make YouTube, Google Maps, Gmail, and Android phones.",
    funFact: "Google's name comes from 'googol' - the number 1 followed by 100 zeros!",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft",
    logo: "🪟",
    price: 378.91,
    change: 4.23,
    changePercent: 1.13,
    marketCap: 2810000000000,
    revenue: 212000000000,
    employees: 221000,
    founded: 1975,
    ceo: "Satya Nadella",
    industry: "Technology",
    description: "Microsoft makes Windows (the software on most computers), Xbox gaming consoles, and Microsoft Office (Word, Excel, PowerPoint).",
    funFact: "Bill Gates started Microsoft when he was just 19 years old - still a teenager!",
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon",
    logo: "📦",
    price: 178.25,
    change: 3.15,
    changePercent: 1.80,
    marketCap: 1860000000000,
    revenue: 575000000000,
    employees: 1540000,
    founded: 1994,
    ceo: "Andy Jassy",
    industry: "E-commerce & Cloud",
    description: "Amazon is the world's biggest online store! They deliver packages, have Prime Video for movies, and Alexa - the smart speaker that talks to you.",
    funFact: "Amazon started by just selling books online. Now they sell almost everything!",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla",
    logo: "🚗",
    price: 248.50,
    change: -5.30,
    changePercent: -2.09,
    marketCap: 790000000000,
    revenue: 97000000000,
    employees: 140000,
    founded: 2003,
    ceo: "Elon Musk",
    industry: "Electric Vehicles",
    description: "Tesla makes electric cars that don't need gas! They also make big batteries to store energy from the sun and solar panels for houses.",
    funFact: "Tesla cars can update themselves overnight, just like your phone or tablet!",
  },
  DIS: {
    symbol: "DIS",
    name: "Disney",
    logo: "🏰",
    price: 112.45,
    change: 1.85,
    changePercent: 1.67,
    marketCap: 205000000000,
    revenue: 89000000000,
    employees: 220000,
    founded: 1923,
    ceo: "Bob Iger",
    industry: "Entertainment",
    description: "Disney makes your favorite movies like Frozen, The Lion King, and all the Marvel and Star Wars films! They also have theme parks and Disney+.",
    funFact: "Mickey Mouse's first cartoon was released in 1928 - he's almost 100 years old!",
  },
  NKE: {
    symbol: "NKE",
    name: "Nike",
    logo: "👟",
    price: 98.75,
    change: 0.65,
    changePercent: 0.66,
    marketCap: 150000000000,
    revenue: 51000000000,
    employees: 83700,
    founded: 1964,
    ceo: "John Donahoe",
    industry: "Sportswear",
    description: "Nike makes athletic shoes, clothes, and equipment. They sponsor famous athletes like LeBron James and make the cool 'swoosh' logo!",
    funFact: "Nike was originally called 'Blue Ribbon Sports' and sold shoes out of a car trunk!",
  },
  MCD: {
    symbol: "MCD",
    name: "McDonald's",
    logo: "🍔",
    price: 295.80,
    change: 2.10,
    changePercent: 0.71,
    marketCap: 215000000000,
    revenue: 23000000000,
    employees: 150000,
    founded: 1940,
    ceo: "Chris Kempczinski",
    industry: "Fast Food",
    description: "McDonald's is the world's largest fast-food restaurant! They're famous for Big Macs, chicken nuggets, fries, and Happy Meals with toys.",
    funFact: "McDonald's serves about 69 million people every single day - that's like feeding a whole country!",
  },
  NFLX: {
    symbol: "NFLX",
    name: "Netflix",
    logo: "🎬",
    price: 478.20,
    change: -8.50,
    changePercent: -1.75,
    marketCap: 210000000000,
    revenue: 33000000000,
    employees: 13000,
    founded: 1997,
    ceo: "Ted Sarandos",
    industry: "Streaming",
    description: "Netflix lets you watch movies and TV shows anytime you want! They make popular shows like Stranger Things and lots of great movies.",
    funFact: "Netflix started by mailing DVDs to people's homes before streaming was invented!",
  },
  SBUX: {
    symbol: "SBUX",
    name: "Starbucks",
    logo: "☕",
    price: 97.35,
    change: 1.25,
    changePercent: 1.30,
    marketCap: 110000000000,
    revenue: 36000000000,
    employees: 402000,
    founded: 1971,
    ceo: "Laxman Narasimhan",
    industry: "Coffee & Beverages",
    description: "Starbucks is the world's biggest coffee shop chain! They make coffee drinks, Frappuccinos, hot chocolate, and yummy snacks.",
    funFact: "The Starbucks mermaid logo is called a 'siren' and she's been on cups since the very beginning!",
  },
};

const searchSuggestions = [
  { symbol: "AAPL", name: "Apple", emoji: "🍎" },
  { symbol: "GOOGL", name: "Google", emoji: "🔍" },
  { symbol: "MSFT", name: "Microsoft", emoji: "🪟" },
  { symbol: "AMZN", name: "Amazon", emoji: "📦" },
  { symbol: "TSLA", name: "Tesla", emoji: "🚗" },
  { symbol: "DIS", name: "Disney", emoji: "🏰" },
  { symbol: "NKE", name: "Nike", emoji: "👟" },
  { symbol: "MCD", name: "McDonald's", emoji: "🍔" },
  { symbol: "NFLX", name: "Netflix", emoji: "🎬" },
  { symbol: "SBUX", name: "Starbucks", emoji: "☕" },
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
  if (num >= 1000000000000) {
    const trillions = num / 1000000000000;
    return {
      value: `$${trillions.toFixed(1)}`,
      unit: "trillion",
      explanation: `That's ${trillions.toFixed(1)} thousand billion dollars!`,
    };
  }
  if (num >= 1000000000) {
    const billions = num / 1000000000;
    return {
      value: `$${billions.toFixed(0)}`,
      unit: "billion",
      explanation: `You could buy ${Math.floor(billions * 100)} million ice cream cones!`,
    };
  }
  if (num >= 1000000) {
    const millions = num / 1000000;
    return {
      value: `$${millions.toFixed(0)}`,
      unit: "million",
      explanation: `That could buy ${Math.floor(millions / 3)} houses!`,
    };
  }
  return {
    value: `$${num.toLocaleString()}`,
    unit: "",
    explanation: "",
  };
}

function formatEmployees(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)} thousand`;
  }
  return num.toString();
}

interface FinancialCardProps {
  title: string;
  emoji: string;
  value: string;
  unit?: string;
  explanation: string;
  color: string;
  delay: number;
}

function FinancialCard({ title, emoji, value, unit, explanation, color, delay }: FinancialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="bg-white/60 backdrop-blur-sm rounded-[20px] p-5 border border-white/50 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{emoji}</span>
        <span className="text-sm font-medium text-[var(--text-muted)]">{title}</span>
      </div>
      <div className="mb-2">
        <span className="font-display text-2xl font-bold" style={{ color: `var(--${color})` }}>
          {value}
        </span>
        {unit && <span className="text-lg text-[var(--text-secondary)] ml-1">{unit}</span>}
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{explanation}</p>
    </motion.div>
  );
}

export default function CompanySearch() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = searchSuggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.symbol.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = (symbolOrName: string) => {
    setIsLoading(true);
    setShowSuggestions(false);
    setNotFound(false);

    // Simulate API delay
    setTimeout(() => {
      const upperSymbol = symbolOrName.toUpperCase();
      const found = companyDatabase[upperSymbol] ||
        Object.values(companyDatabase).find(
          (c) => c.name.toLowerCase().includes(symbolOrName.toLowerCase())
        );

      if (found) {
        setSelectedCompany(found);
        setQuery(found.name);
        setNotFound(false);
      } else {
        setSelectedCompany(null);
        setNotFound(true);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch(query.trim());
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

  const isUp = selectedCompany ? selectedCompany.change >= 0 : true;
  const marketCap = selectedCompany ? formatLargeNumber(selectedCompany.marketCap) : null;
  const revenue = selectedCompany ? formatLargeNumber(selectedCompany.revenue) : null;

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
          Type a company name to see what they do and how much they're worth -
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
              setNotFound(false);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a company name (like Apple, Nike, or Disney)"
            className="w-full pl-14 pr-32 py-5 text-lg bg-white/90 border-2 border-transparent rounded-[20px] shadow-[var(--shadow-soft)] focus:outline-none focus:border-[var(--coral)] focus:shadow-[0_0_0_4px_rgba(255,127,107,0.2)] transition-all"
          />
          <button
            onClick={() => query.trim() && handleSearch(query.trim())}
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-[var(--coral)] to-[var(--coral-dark)] text-white font-display font-semibold rounded-[14px] hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && query.length > 0 && filteredSuggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-2 bg-white rounded-[16px] shadow-[var(--shadow-medium)] overflow-hidden"
            >
              {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
                <button
                  key={suggestion.symbol}
                  onClick={() => handleSearch(suggestion.symbol)}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-[var(--cream)] transition-colors text-left"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-2xl">{suggestion.emoji}</span>
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{suggestion.name}</span>
                    <span className="text-sm text-[var(--text-muted)] ml-2">{suggestion.symbol}</span>
                  </div>
                </button>
              ))}
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
        <span className="text-sm text-[var(--text-muted)] self-center mr-2">Try these:</span>
        {searchSuggestions.slice(0, 6).map((s, i) => (
          <motion.button
            key={s.symbol}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => handleSearch(s.symbol)}
            className="px-4 py-2 bg-white/70 hover:bg-white rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm hover:shadow-md transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>{s.emoji}</span>
            <span>{s.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Not Found Message */}
      <AnimatePresence>
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <span className="text-6xl mb-4 block">🤔</span>
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
              Hmm, we couldn't find that company
            </h3>
            <p className="text-[var(--text-secondary)]">
              Try searching for a well-known company like Apple, Disney, or Nike!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Results */}
      <AnimatePresence mode="wait">
        {selectedCompany && !isLoading && (
          <motion.div
            key={selectedCompany.symbol}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Company Header Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[28px] p-8 shadow-[var(--shadow-soft)] mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Logo and Name */}
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 bg-gradient-to-br from-[var(--cream)] to-white rounded-[18px] flex items-center justify-center text-5xl shadow-inner"
                  >
                    {selectedCompany.logo}
                  </motion.div>
                  <div>
                    <h3 className="font-display text-3xl font-bold text-[var(--text-primary)]">
                      {selectedCompany.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 bg-[var(--cream-dark)] rounded-full text-sm font-medium text-[var(--text-secondary)]">
                        {selectedCompany.symbol}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">
                        {selectedCompany.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Price */}
                <div className="text-right">
                  <div className="font-display text-4xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(selectedCompany.price)}
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
                      {isUp ? "+" : ""}{formatCurrency(selectedCompany.change)} ({isUp ? "+" : ""}
                      {selectedCompany.changePercent.toFixed(2)}%)
                    </span>
                  </motion.div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {isUp ? "The stock went up today!" : "The stock went down today."}
                  </p>
                </div>
              </div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 pt-6 border-t border-[var(--cream-dark)]"
              >
                <h4 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
                  What does {selectedCompany.name} do?
                </h4>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                  {selectedCompany.description}
                </p>
              </motion.div>

              {/* Fun Fact */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 p-4 bg-[var(--sunny-light)]/30 rounded-[16px] flex items-start gap-3"
              >
                <span className="text-2xl">💡</span>
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">Fun Fact: </span>
                  <span className="text-[var(--text-secondary)]">{selectedCompany.funFact}</span>
                </div>
              </motion.div>
            </div>

            {/* Financial Stats Grid */}
            <h4 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4 px-2">
              The Money Numbers 💰
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FinancialCard
                title="How much is the company worth?"
                emoji="🏦"
                value={marketCap?.value || ""}
                unit={marketCap?.unit}
                explanation={`This is called "market cap" - if you added up all the tiny pieces (stocks) of ${selectedCompany.name}, this is what they're worth together!`}
                color="coral"
                delay={0.1}
              />
              <FinancialCard
                title="How much money do they make?"
                emoji="💵"
                value={revenue?.value || ""}
                unit={revenue?.unit}
                explanation={`This is their "revenue" - all the money people pay ${selectedCompany.name} for their products and services in one year!`}
                color="teal"
                delay={0.2}
              />
              <FinancialCard
                title="How many people work there?"
                emoji="👥"
                value={formatEmployees(selectedCompany.employees)}
                unit="people"
                explanation={`That's like ${Math.floor(selectedCompany.employees / 500)} large schools full of people! They all help make ${selectedCompany.name} products.`}
                color="lavender"
                delay={0.3}
              />
              <FinancialCard
                title="When did they start?"
                emoji="🎂"
                value={selectedCompany.founded.toString()}
                explanation={`${selectedCompany.name} is ${new Date().getFullYear() - selectedCompany.founded} years old! That's ${selectedCompany.founded < 1980 ? "even older than the internet" : selectedCompany.founded < 2000 ? "older than most smartphones" : "younger than YouTube"}!`}
                color="sunny"
                delay={0.4}
              />
              <FinancialCard
                title="Who's the boss?"
                emoji="👔"
                value={selectedCompany.ceo}
                explanation={`The CEO is like the captain of the ship - they make the big decisions about where ${selectedCompany.name} is going!`}
                color="mint"
                delay={0.5}
              />
              <FinancialCard
                title="Stock price today"
                emoji={isUp ? "📈" : "📉"}
                value={formatCurrency(selectedCompany.price)}
                explanation={`This is how much one tiny piece (share) of ${selectedCompany.name} costs. ${isUp ? "It's going up - people want to buy it!" : "It went down a bit - but that's normal, stocks go up and down all the time!"}`}
                color={isUp ? "up-green" : "down-red"}
                delay={0.6}
              />
            </div>

            {/* Understanding Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-6 bg-gradient-to-br from-[var(--lavender-light)]/20 to-[var(--teal-light)]/20 rounded-[24px]"
            >
              <h4 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span>🎓</span> What does this all mean?
              </h4>
              <div className="space-y-4 text-[var(--text-secondary)]">
                <p>
                  <strong className="text-[var(--text-primary)]">Think of it like a lemonade stand:</strong> If your
                  lemonade stand was a company, the "market cap" would be how much the whole stand is worth. The
                  "revenue" is all the money people pay you for lemonade. And the "stock price" is like selling tiny
                  pieces of your stand to friends - they own a little bit and hope the stand does well!
                </p>
                <p>
                  When lots of people want to buy pieces of {selectedCompany.name}, the stock price goes up (📈).
                  When fewer people want to buy, it goes down (📉). It's like how popular toys cost more during the holidays!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!selectedCompany && !isLoading && !notFound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🔭
          </motion.div>
          <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
            Ready to explore?
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Search for any company above to learn about what they do and see their numbers explained in a way that's easy to understand!
          </p>
        </motion.div>
      )}
    </section>
  );
}
