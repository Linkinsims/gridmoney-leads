export type UserType = "business" | "hustler";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type LeadStatus = "pending" | "accepted" | "rejected" | "expired";
export type TransactionType =
  | "deposit"
  | "payout"
  | "withdrawal"
  | "refund"
  | "fee";
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";
export type HustlerRank = "bronze" | "silver" | "gold" | "diamond";

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  avatar_url: string | null;
  phone: string | null;
  province: string | null;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  website: string | null;
  description: string;
  total_spent: number;
  wallet_balance: number;
  created_at: string;
  users?: User;
}

export interface HustlerProfile {
  id: string;
  user_id: string;
  bio: string;
  total_earned: number;
  pending_earnings: number;
  withdrawn_earnings: number;
  total_leads_submitted: number;
  acceptance_rate: number;
  rank: HustlerRank;
  created_at: string;
  users?: User;
}

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  description: string;
  category: string;
  target_province: string;
  price_per_lead: number;
  budget_total: number;
  budget_spent: number;
  leads_needed: number;
  leads_received: number;
  status: CampaignStatus;
  ideal_customer: string;
  requirements: string;
  expires_at: string;
  created_at: string;
  business_profiles?: BusinessProfile;
}

export interface Lead {
  id: string;
  campaign_id: string;
  hustler_id: string;
  business_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  contact_province: string;
  notes: string;
  status: LeadStatus;
  rejection_reason: string | null;
  payout_amount: number;
  platform_fee: number;
  submitted_at: string;
  reviewed_at: string | null;
  campaigns?: Campaign;
  hustler_profiles?: HustlerProfile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  reference: string | null;
  status: string;
  description: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  hustler_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  account_type: string;
  status: WithdrawalStatus;
  requested_at: string;
  processed_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at"> & { created_at?: string };
        Update: Partial<User>;
      };
      business_profiles: {
        Row: BusinessProfile;
        Insert: Omit<BusinessProfile, "id" | "created_at" | "total_spent" | "wallet_balance"> & { id?: string; total_spent?: number; wallet_balance?: number; created_at?: string };
        Update: Partial<BusinessProfile>;
      };
      hustler_profiles: {
        Row: HustlerProfile;
        Insert: Omit<HustlerProfile, "id" | "created_at" | "total_earned" | "pending_earnings" | "withdrawn_earnings" | "total_leads_submitted" | "acceptance_rate" | "rank"> & { id?: string; created_at?: string };
        Update: Partial<HustlerProfile>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at" | "budget_spent" | "leads_received"> & { id?: string; created_at?: string; budget_spent?: number; leads_received?: number };
        Update: Partial<Campaign>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "submitted_at" | "reviewed_at" | "status"> & { id?: string; submitted_at?: string; reviewed_at?: string | null; status?: LeadStatus };
        Update: Partial<Lead>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Transaction>;
      };
      withdrawal_requests: {
        Row: WithdrawalRequest;
        Insert: Omit<WithdrawalRequest, "id" | "requested_at" | "processed_at" | "status"> & { id?: string; requested_at?: string; processed_at?: string | null; status?: WithdrawalStatus };
        Update: Partial<WithdrawalRequest>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "is_read"> & { id?: string; created_at?: string; is_read?: boolean };
        Update: Partial<Notification>;
      };
    };
  };
}
