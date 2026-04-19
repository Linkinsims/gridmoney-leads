export const CATEGORIES = [
  { value: "real-estate", label: "Real Estate", icon: "🏠" },
  { value: "solar-energy", label: "Solar Energy", icon: "☀️" },
  { value: "insurance", label: "Insurance", icon: "🛡️" },
  { value: "financial-services", label: "Financial Services", icon: "💳" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "legal-services", label: "Legal Services", icon: "⚖️" },
];

export const PROVINCES = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export const SA_BANKS = [
  "ABSA",
  "Capitec Bank",
  "FNB (First National Bank)",
  "Nedbank",
  "Standard Bank",
  "African Bank",
  "Discovery Bank",
  "TymeBank",
  "Bidvest Bank",
  "Investec",
];

export const HOW_YOU_KNOW_OPTIONS = [
  "Family member",
  "Friend or colleague",
  "Neighbour",
  "Social media connection",
  "Community group member",
  "Work contact",
  "Business associate",
  "Other",
];

export const RANK_THRESHOLDS = {
  bronze: { min: 0, max: 10, label: "Bronze", color: "#CD7F32" },
  silver: { min: 11, max: 50, label: "Silver", color: "#C0C0C0" },
  gold: { min: 51, max: 200, label: "Gold", color: "#F5A623" },
  diamond: { min: 201, max: Infinity, label: "Diamond", color: "#B9F2FF" },
};

export const PLATFORM_FEE_RATE = 0.15;
export const MIN_LEAD_PRICE = 50;
export const MAX_LEAD_PRICE = 500;
export const MIN_WITHDRAWAL = 100;
export const LEAD_EXPIRY_HOURS = 48;

export const TOPUP_AMOUNTS = [500, 1000, 2500, 5000];

export const NOTIFICATION_TYPES = {
  NEW_LEAD: "new_lead",
  LEAD_ACCEPTED: "lead_accepted",
  LEAD_REJECTED: "lead_rejected",
  CAMPAIGN_BUDGET_WARNING: "campaign_budget_warning",
  CAMPAIGN_EXPIRING: "campaign_expiring",
  WITHDRAWAL_PROCESSED: "withdrawal_processed",
  WALLET_TOPPED_UP: "wallet_topped_up",
};
