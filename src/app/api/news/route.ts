import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { NewsItem } from "@/lib/types/database";

const yahooFinance = new YahooFinance();

// Sentiment keywords for kid-friendly analysis
const POSITIVE_WORDS = ['rise', 'rises', 'gain', 'gains', 'up', 'surge', 'surges', 'jump', 'jumps', 'rally', 'rallies', 'record', 'high', 'profit', 'profits', 'growth', 'beat', 'beats', 'success', 'win', 'wins'];
const NEGATIVE_WORDS = ['fall', 'falls', 'drop', 'drops', 'down', 'decline', 'declines', 'crash', 'crashes', 'low', 'loss', 'losses', 'miss', 'misses', 'fail', 'fails', 'cut', 'cuts', 'warning', 'concern'];

function analyzeSentiment(title: string): 'positive' | 'neutral' | 'negative' {
  const lowerTitle = title.toLowerCase();
  const positiveCount = POSITIVE_WORDS.filter(word => lowerTitle.includes(word)).length;
  const negativeCount = NEGATIVE_WORDS.filter(word => lowerTitle.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getSentimentEmoji(sentiment: 'positive' | 'neutral' | 'negative'): string {
  const emojis = {
    positive: ['📈', '🚀', '🎉', '💪', '⭐'][Math.floor(Math.random() * 5)],
    neutral: ['📰', '📋', '📊', '🔔', '💬'][Math.floor(Math.random() * 5)],
    negative: ['📉', '⚠️', '🤔', '💭', '🔻'][Math.floor(Math.random() * 5)],
  };
  return emojis[sentiment];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePublishTime(publishTime: any): Date {
  if (!publishTime) return new Date();

  // If it's already a Date object
  if (publishTime instanceof Date) return publishTime;

  // If it's a string (ISO format or other)
  if (typeof publishTime === 'string') return new Date(publishTime);

  // If it's a number - could be seconds or milliseconds
  if (typeof publishTime === 'number') {
    // If the number is less than a reasonable milliseconds value (year 2001), it's probably seconds
    if (publishTime < 1000000000000) {
      return new Date(publishTime * 1000);
    }
    return new Date(publishTime);
  }

  return new Date();
}

function getTimeAgo(publishTime: unknown): string {
  const date = parsePublishTime(publishTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates or invalid dates
  if (diffMs < 0 || isNaN(diffMs)) return 'Just now';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformToNewsItem(rawNews: any): NewsItem {
  const sentiment = analyzeSentiment(rawNews.title || '');

  return {
    id: rawNews.uuid || crypto.randomUUID(),
    title: rawNews.title || 'Market Update',
    summary: rawNews.publisher || 'Financial News',
    source: rawNews.publisher || 'News',
    publishedAt: getTimeAgo(rawNews.providerPublishTime),
    url: rawNews.link || '#',
    thumbnail: rawNews.thumbnail?.resolutions?.[0]?.url,
    relatedSymbols: rawNews.relatedTickers || [],
    sentiment,
    emoji: getSentimentEmoji(sentiment),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  try {
    // Search for S&P 500 news as general market news
    const result = await yahooFinance.search("^GSPC", {
      newsCount: limit,
      quotesCount: 0
    });

    const news = (result.news || [])
      .slice(0, limit)
      .map(transformToNewsItem);

    return NextResponse.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
