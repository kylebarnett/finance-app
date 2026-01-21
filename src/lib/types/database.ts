// Database types for Flynn

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_emoji: string;
  age_group: '8-10' | '11-13' | '14-17' | 'adult' | null;
  parent_email: string | null;
  is_parent_verified: boolean;
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
