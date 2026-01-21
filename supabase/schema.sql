-- Flynn Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '🐣',
  age_group TEXT CHECK (age_group IN ('8-10', '11-13', '14-17', 'adult')),
  parent_email TEXT,
  is_parent_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper trading accounts
CREATE TABLE paper_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  account_name TEXT DEFAULT 'My Portfolio',
  starting_balance DECIMAL(12,2) DEFAULT 10000.00,
  current_cash DECIMAL(12,2) DEFAULT 10000.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio holdings
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_account_id UUID REFERENCES paper_accounts ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  average_cost DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_account_id, symbol)
);

-- Transaction history
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_account_id UUID REFERENCES paper_accounts ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_share DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily portfolio snapshots for performance tracking
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_account_id UUID REFERENCES paper_accounts ON DELETE CASCADE NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  cash_value DECIMAL(12,2) NOT NULL,
  holdings_value DECIMAL(12,2) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paper_account_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for paper_accounts
CREATE POLICY "Users can view own accounts"
  ON paper_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own accounts"
  ON paper_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts"
  ON paper_accounts FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for holdings
CREATE POLICY "Users can view own holdings"
  ON holdings FOR SELECT
  USING (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own holdings"
  ON holdings FOR ALL
  USING (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

-- RLS Policies for portfolio_snapshots
CREATE POLICY "Users can view own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create own snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (paper_account_id IN (
    SELECT id FROM paper_accounts WHERE user_id = auth.uid()
  ));

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-create paper account when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.paper_accounts (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create paper account on profile creation
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paper_accounts_updated_at
  BEFORE UPDATE ON paper_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
