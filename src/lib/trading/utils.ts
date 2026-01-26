/**
 * Trading utilities for financial calculations and validation
 * All monetary values are rounded to 2 decimal places to prevent floating point errors
 */

// Round to 2 decimal places for currency
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

// Round to 4 decimal places for average cost (more precision needed)
export function roundAverageCost(value: number): number {
  return Math.round(value * 10000) / 10000;
}

// Calculate total cost with proper rounding
export function calculateTotalCost(price: number, quantity: number): number {
  return roundCurrency(price * quantity);
}

// Calculate new average cost when adding to position
export function calculateNewAverageCost(
  existingQuantity: number,
  existingAverageCost: number,
  newQuantity: number,
  newPrice: number
): number {
  const totalShares = existingQuantity + newQuantity;
  const totalCost = (existingQuantity * existingAverageCost) + (newQuantity * newPrice);
  return roundAverageCost(totalCost / totalShares);
}

// Validate stock price is reasonable
export function isValidPrice(price: number | undefined | null): price is number {
  if (price === undefined || price === null) return false;
  if (typeof price !== "number") return false;
  if (!isFinite(price)) return false;
  if (price <= 0) return false;
  if (price > 1000000) return false; // Sanity check - no stock over $1M
  return true;
}

// Validate quantity
export function isValidQuantity(quantity: number | undefined | null): quantity is number {
  if (quantity === undefined || quantity === null) return false;
  if (typeof quantity !== "number") return false;
  if (!Number.isInteger(quantity)) return false;
  if (quantity < 1) return false;
  if (quantity > 10000) return false; // Max 10,000 shares per trade
  return true;
}

// Generate idempotency key from request parameters
export function generateIdempotencyKey(
  userId: string,
  symbol: string,
  type: "BUY" | "SELL",
  quantity: number,
  timestamp: number
): string {
  // Round timestamp to nearest 5 seconds to catch rapid duplicate clicks
  const roundedTimestamp = Math.floor(timestamp / 5000) * 5000;
  return `${userId}-${symbol}-${type}-${quantity}-${roundedTimestamp}`;
}

// Simple in-memory rate limiter (per-user)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

// Constants
export const STARTING_CASH = 10000;
export const MIN_TRADE_AMOUNT = 1; // Minimum $1 trade
export const MAX_SHARES_PER_TRADE = 10000;
export const MAX_TRADE_VALUE = 2000; // Max $2000 per single trade (parental control)
export const MAX_TRADES_PER_DAY = 50; // Max 50 trades per day (prevent spam)

// Daily trade counter (in-memory, resets on server restart)
const dailyTradeCount = new Map<string, { count: number; date: string }>();

export function checkDailyTradeLimit(userId: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const userTrades = dailyTradeCount.get(userId);

  if (!userTrades || userTrades.date !== today) {
    // Reset for new day
    dailyTradeCount.set(userId, { count: 0, date: today });
    return { allowed: true, remaining: MAX_TRADES_PER_DAY };
  }

  const remaining = MAX_TRADES_PER_DAY - userTrades.count;
  return { allowed: remaining > 0, remaining };
}

export function incrementDailyTradeCount(userId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const userTrades = dailyTradeCount.get(userId);

  if (!userTrades || userTrades.date !== today) {
    dailyTradeCount.set(userId, { count: 1, date: today });
  } else {
    userTrades.count++;
  }
}

export function checkTradeValueLimit(totalValue: number): { allowed: boolean; maxAllowed: number } {
  return {
    allowed: totalValue <= MAX_TRADE_VALUE,
    maxAllowed: MAX_TRADE_VALUE,
  };
}
