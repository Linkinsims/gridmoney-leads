-- GridMoney Leads — Initial Schema Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_type AS ENUM ('business', 'hustler');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE lead_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE transaction_type AS ENUM ('deposit', 'payout', 'withdrawal', 'refund', 'fee');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
CREATE TYPE hustler_rank AS ENUM ('bronze', 'silver', 'gold', 'diamond');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (mirrors auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  user_type user_type,
  avatar_url TEXT,
  phone TEXT,
  province TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Profiles
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website TEXT,
  description TEXT NOT NULL DEFAULT '',
  total_spent NUMERIC NOT NULL DEFAULT 0,
  wallet_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hustler Profiles
CREATE TABLE hustler_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  total_earned NUMERIC NOT NULL DEFAULT 0,
  pending_earnings NUMERIC NOT NULL DEFAULT 0,
  withdrawn_earnings NUMERIC NOT NULL DEFAULT 0,
  total_leads_submitted INTEGER NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC NOT NULL DEFAULT 0,
  rank hustler_rank NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_province TEXT NOT NULL DEFAULT 'All Provinces',
  price_per_lead NUMERIC NOT NULL,
  budget_total NUMERIC NOT NULL,
  budget_spent NUMERIC NOT NULL DEFAULT 0,
  leads_needed INTEGER NOT NULL DEFAULT 0,
  leads_received INTEGER NOT NULL DEFAULT 0,
  status campaign_status NOT NULL DEFAULT 'draft',
  ideal_customer TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT price_range CHECK (price_per_lead >= 50 AND price_per_lead <= 500)
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  hustler_id UUID NOT NULL REFERENCES hustler_profiles(id),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  contact_province TEXT NOT NULL,
  notes TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  payout_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  -- Prevent duplicate phone per campaign
  CONSTRAINT unique_lead_per_campaign UNIQUE (campaign_id, contact_phone)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal Requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hustler_id UUID NOT NULL REFERENCES hustler_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'savings',
  status withdrawal_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX idx_leads_hustler_id ON leads(hustler_id);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hustler_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- BUSINESS PROFILES
CREATE POLICY "Business owners can manage their profile" ON business_profiles 
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone can view business profiles" ON business_profiles 
  FOR SELECT USING (true);

-- HUSTLER PROFILES  
CREATE POLICY "Hustler owners can manage their profile" ON hustler_profiles 
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone can view hustler profiles" ON hustler_profiles 
  FOR SELECT USING (true);

-- CAMPAIGNS
CREATE POLICY "Businesses can manage their campaigns" ON campaigns 
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Active campaigns are publicly readable" ON campaigns 
  FOR SELECT USING (status = 'active');

-- LEADS
CREATE POLICY "Hustlers can submit leads" ON leads 
  FOR INSERT WITH CHECK (
    hustler_id IN (SELECT id FROM hustler_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Hustlers can view their own leads" ON leads 
  FOR SELECT USING (
    hustler_id IN (SELECT id FROM hustler_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Businesses can view leads on their campaigns" ON leads 
  FOR SELECT USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Businesses can update lead status" ON leads 
  FOR UPDATE USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
  );

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON transactions 
  FOR SELECT USING (user_id = auth.uid());

-- WITHDRAWAL REQUESTS
CREATE POLICY "Hustlers can manage their withdrawal requests" ON withdrawal_requests 
  FOR ALL USING (
    hustler_id IN (SELECT id FROM hustler_profiles WHERE user_id = auth.uid())
  );

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user record after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to accept a lead (atomic payout flow)
CREATE OR REPLACE FUNCTION accept_lead(lead_id UUID)
RETURNS VOID AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_hustler_user_id UUID;
  v_business_user_id UUID;
  v_total_charge NUMERIC;
  v_accepted_count INTEGER;
  v_new_rank hustler_rank;
  v_new_acceptance_rate NUMERIC;
  v_total_submitted INTEGER;
BEGIN
  -- Fetch lead
  SELECT * INTO v_lead FROM leads WHERE id = lead_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Lead not found or not pending'; END IF;

  -- Check budget
  PERFORM 1 FROM business_profiles WHERE id = v_lead.business_id;
  
  v_total_charge := v_lead.payout_amount + v_lead.platform_fee;

  -- Check business has sufficient balance
  IF (SELECT wallet_balance FROM business_profiles WHERE id = v_lead.business_id) < v_total_charge THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Get user IDs
  SELECT user_id INTO v_hustler_user_id FROM hustler_profiles WHERE id = v_lead.hustler_id;
  SELECT user_id INTO v_business_user_id FROM business_profiles WHERE id = v_lead.business_id;

  -- Update lead status
  UPDATE leads SET status = 'accepted', reviewed_at = NOW() WHERE id = lead_id;

  -- Debit business wallet
  UPDATE business_profiles 
  SET wallet_balance = wallet_balance - v_total_charge,
      total_spent = total_spent + v_total_charge,
      budget_spent = budget_spent + v_total_charge
  WHERE id = v_lead.business_id;

  -- Update campaign
  UPDATE campaigns 
  SET budget_spent = budget_spent + v_total_charge,
      leads_received = leads_received + 1
  WHERE id = v_lead.campaign_id;

  -- Credit hustler pending earnings
  UPDATE hustler_profiles 
  SET pending_earnings = pending_earnings + v_lead.payout_amount,
      total_earned = total_earned + v_lead.payout_amount
  WHERE id = v_lead.hustler_id;

  -- Recalculate acceptance rate and rank
  SELECT COUNT(*) INTO v_accepted_count 
  FROM leads WHERE hustler_id = v_lead.hustler_id AND status = 'accepted';
  
  SELECT total_leads_submitted INTO v_total_submitted 
  FROM hustler_profiles WHERE id = v_lead.hustler_id;

  IF v_total_submitted > 0 THEN
    v_new_acceptance_rate := (v_accepted_count::NUMERIC / v_total_submitted) * 100;
  ELSE
    v_new_acceptance_rate := 0;
  END IF;

  -- Calculate rank
  IF v_accepted_count >= 201 THEN v_new_rank := 'diamond';
  ELSIF v_accepted_count >= 51 THEN v_new_rank := 'gold';
  ELSIF v_accepted_count >= 11 THEN v_new_rank := 'silver';
  ELSE v_new_rank := 'bronze';
  END IF;

  UPDATE hustler_profiles 
  SET acceptance_rate = v_new_acceptance_rate, rank = v_new_rank
  WHERE id = v_lead.hustler_id;

  -- Record transactions
  INSERT INTO transactions (user_id, type, amount, reference, status, description)
  VALUES
    (v_hustler_user_id, 'payout', v_lead.payout_amount, lead_id::TEXT, 'completed', 
     'Lead accepted payout'),
    (v_business_user_id, 'fee', v_lead.platform_fee, lead_id::TEXT, 'completed', 
     'Platform fee (15%)');

  -- Check if campaign should be auto-completed
  UPDATE campaigns 
  SET status = 'completed'
  WHERE id = v_lead.campaign_id 
    AND budget_spent >= budget_total
    AND status = 'active';

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old pending leads (called by cron)
CREATE OR REPLACE FUNCTION expire_old_leads()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE leads 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND submitted_at < NOW() - INTERVAL '48 hours';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
