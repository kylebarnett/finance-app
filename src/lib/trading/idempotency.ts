/**
 * Idempotency service to prevent duplicate trades
 * Uses in-memory cache with automatic cleanup
 */

interface PendingTrade {
  key: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  result?: unknown;
}

// In-memory store for pending/recent trades
const recentTrades = new Map<string, PendingTrade>();

// How long to remember trades (5 minutes)
const TRADE_TTL = 5 * 60 * 1000;

/**
 * Check if a trade is already in progress or was recently completed
 * Returns the existing result if found, or null if this is a new trade
 */
export function checkIdempotency(key: string): { isDuplicate: boolean; existingResult?: unknown } {
  const existing = recentTrades.get(key);

  if (!existing) {
    return { isDuplicate: false };
  }

  // If it's still pending, treat as duplicate
  if (existing.status === "pending") {
    return { isDuplicate: true };
  }

  // If completed, return the cached result
  if (existing.status === "completed" && existing.result) {
    return { isDuplicate: true, existingResult: existing.result };
  }

  // If failed, allow retry
  if (existing.status === "failed") {
    return { isDuplicate: false };
  }

  return { isDuplicate: true };
}

/**
 * Mark a trade as pending (starting)
 */
export function markTradePending(key: string): void {
  recentTrades.set(key, {
    key,
    timestamp: Date.now(),
    status: "pending",
  });
}

/**
 * Mark a trade as completed with result
 */
export function markTradeCompleted(key: string, result: unknown): void {
  recentTrades.set(key, {
    key,
    timestamp: Date.now(),
    status: "completed",
    result,
  });
}

/**
 * Mark a trade as failed (allows retry)
 */
export function markTradeFailed(key: string): void {
  const existing = recentTrades.get(key);
  if (existing) {
    existing.status = "failed";
  }
}

/**
 * Generate a unique key for a trade
 */
export function generateTradeKey(
  userId: string,
  symbol: string,
  type: "BUY" | "SELL",
  quantity: number
): string {
  // Round to 3-second window to catch rapid clicks
  const timeWindow = Math.floor(Date.now() / 3000);
  return `trade:${userId}:${symbol}:${type}:${quantity}:${timeWindow}`;
}

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, trade] of recentTrades.entries()) {
    if (now - trade.timestamp > TRADE_TTL) {
      recentTrades.delete(key);
    }
  }
}, 60000);
