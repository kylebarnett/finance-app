import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Child-friendly descriptions and fun facts for popular companies
const companyInfo: Record<string, { description: string; funFact: string; emoji: string }> = {
  AAPL: {
    emoji: "🍎",
    description: "Apple makes iPhones, iPads, Mac computers, and the Apple Watch. They also have a TV streaming service and make those cool AirPods!",
    funFact: "Apple started in a garage! Steve Jobs and his friends built the first Apple computer there.",
  },
  GOOGL: {
    emoji: "🔍",
    description: "Google is the world's most popular search engine! They also make YouTube, Google Maps, Gmail, and Android phones.",
    funFact: "Google's name comes from 'googol' - the number 1 followed by 100 zeros!",
  },
  GOOG: {
    emoji: "🔍",
    description: "Google is the world's most popular search engine! They also make YouTube, Google Maps, Gmail, and Android phones.",
    funFact: "Google's name comes from 'googol' - the number 1 followed by 100 zeros!",
  },
  MSFT: {
    emoji: "🪟",
    description: "Microsoft makes Windows (the software on most computers), Xbox gaming consoles, and Microsoft Office (Word, Excel, PowerPoint).",
    funFact: "Bill Gates started Microsoft when he was just 19 years old - still a teenager!",
  },
  AMZN: {
    emoji: "📦",
    description: "Amazon is the world's biggest online store! They deliver packages, have Prime Video for movies, and Alexa - the smart speaker that talks to you.",
    funFact: "Amazon started by just selling books online. Now they sell almost everything!",
  },
  TSLA: {
    emoji: "🚗",
    description: "Tesla makes electric cars that don't need gas! They also make big batteries to store energy from the sun and solar panels for houses.",
    funFact: "Tesla cars can update themselves overnight, just like your phone or tablet!",
  },
  META: {
    emoji: "👥",
    description: "Meta owns Facebook, Instagram, and WhatsApp - apps that billions of people use to talk to friends and share photos!",
    funFact: "Mark Zuckerberg created Facebook in his college dorm room when he was just 19!",
  },
  NVDA: {
    emoji: "🎮",
    description: "NVIDIA makes the special computer chips that power video games and help computers think really fast with AI!",
    funFact: "NVIDIA chips are used in almost every self-driving car being developed today!",
  },
  DIS: {
    emoji: "🏰",
    description: "Disney makes your favorite movies like Frozen, The Lion King, and all the Marvel and Star Wars films! They also have theme parks and Disney+.",
    funFact: "Mickey Mouse's first cartoon was released in 1928 - he's almost 100 years old!",
  },
  NKE: {
    emoji: "👟",
    description: "Nike makes athletic shoes, clothes, and equipment. They sponsor famous athletes like LeBron James and make the cool 'swoosh' logo!",
    funFact: "Nike was originally called 'Blue Ribbon Sports' and sold shoes out of a car trunk!",
  },
  MCD: {
    emoji: "🍔",
    description: "McDonald's is the world's largest fast-food restaurant! They're famous for Big Macs, chicken nuggets, fries, and Happy Meals with toys.",
    funFact: "McDonald's serves about 69 million people every single day - that's like feeding a whole country!",
  },
  NFLX: {
    emoji: "🎬",
    description: "Netflix lets you watch movies and TV shows anytime you want! They make popular shows like Stranger Things and lots of great movies.",
    funFact: "Netflix started by mailing DVDs to people's homes before streaming was invented!",
  },
  SBUX: {
    emoji: "☕",
    description: "Starbucks is the world's biggest coffee shop chain! They make coffee drinks, Frappuccinos, hot chocolate, and yummy snacks.",
    funFact: "The Starbucks mermaid logo is called a 'siren' and she's been on cups since the very beginning!",
  },
  COST: {
    emoji: "🛒",
    description: "Costco is a giant warehouse store where you can buy huge amounts of food and stuff at lower prices. They're famous for their $1.50 hot dogs!",
    funFact: "Costco has never raised the price of their hot dog combo since 1985!",
  },
  WMT: {
    emoji: "🏪",
    description: "Walmart is one of the biggest stores in the world! You can buy almost anything there - from groceries to toys to clothes.",
    funFact: "Walmart is so big that about 240 million customers visit their stores every week!",
  },
  JPM: {
    emoji: "🏦",
    description: "JPMorgan Chase is one of the largest banks in the world. They help people save money, get loans, and manage their finances.",
    funFact: "The bank is named after J.P. Morgan, who was so rich he once bailed out the entire U.S. government!",
  },
  V: {
    emoji: "💳",
    description: "Visa makes the credit and debit cards that people use to buy things without cash. That little Visa logo is on billions of cards!",
    funFact: "Visa processes over 65,000 transactions every single second!",
  },
  MA: {
    emoji: "💳",
    description: "Mastercard is like Visa - they help people pay for things with cards instead of cash, all around the world!",
    funFact: "The two circles in Mastercard's logo have been part of their brand since 1966!",
  },
};

// Default info for companies we don't have specific data for
const defaultInfo = {
  emoji: "🏢",
  description: "This company is publicly traded on the stock market. Search online to learn more about what they do!",
  funFact: "Every company on the stock market started as someone's idea that grew into something big!",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Stock not found" },
        { status: 404 }
      );
    }

    const info = companyInfo[symbol] || defaultInfo;

    return NextResponse.json({
      success: true,
      data: {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName,
        fullName: quote.longName,
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        changePercent: quote.regularMarketChangePercent ?? 0,
        previousClose: quote.regularMarketPreviousClose ?? 0,
        open: quote.regularMarketOpen ?? 0,
        dayHigh: quote.regularMarketDayHigh ?? 0,
        dayLow: quote.regularMarketDayLow ?? 0,
        volume: quote.regularMarketVolume ?? 0,
        avgVolume: quote.averageDailyVolume3Month ?? 0,
        marketCap: quote.marketCap ?? 0,
        peRatio: quote.trailingPE ?? null,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? 0,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? 0,
        exchange: quote.exchange,
        currency: quote.currency,
        ...info,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock data fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
