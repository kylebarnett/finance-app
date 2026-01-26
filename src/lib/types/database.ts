// Database types for Flynn

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_emoji: string;
  age_group: '8-10' | '11-13' | '14-17' | 'adult' | null;
  parent_email: string | null;
  is_parent_verified: boolean;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface PaperAccount {
  id: string;
  user_id: string;
  account_name: string;
  starting_balance: number;
  current_cash: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  paper_account_id: string;
  symbol: string;
  quantity: number;
  average_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  paper_account_id: string;
  symbol: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price_per_share: number;
  total_amount: number;
  executed_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  paper_account_id: string;
  total_value: number;
  cash_value: number;
  holdings_value: number;
  snapshot_date: string;
  created_at: string;
}

// Extended types with live data
export interface HoldingWithPrice extends Holding {
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
}

export interface PortfolioSummary {
  total_value: number;
  cash_balance: number;
  holdings_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  holdings: HoldingWithPrice[];
}

// Watchlist types
export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string | null;
  added_at: string;
  notes: string | null;
}

export interface WatchlistItemWithPrice extends WatchlistItem {
  current_price: number;
  change: number;
  change_percent: number;
  emoji: string;
}

// Leaderboard types
export interface LeaderboardSettings {
  id: string;
  user_id: string;
  show_on_public_leaderboard: boolean;
  display_name_override: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  total_value: number;
  gain_loss_percent: number;
  trade_count: number;
}

// Friend group types
export interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  created_by: string | null;
  invite_code: string;
  is_active: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface FriendGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface FriendGroupWithDetails extends FriendGroup {
  member_count: number;
  members: (FriendGroupMember & { profile: Profile })[];
}

export interface FriendInvitation {
  id: string;
  inviter_id: string;
  invitee_email: string | null;
  invite_code: string;
  group_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  thumbnail?: string;
  relatedSymbols: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  emoji: string;
}
