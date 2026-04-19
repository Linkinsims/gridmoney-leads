import { HustlerRank, LeadStatus, CampaignStatus } from "@/types/database";
import { PLATFORM_FEE_RATE, RANK_THRESHOLDS } from "./constants";

/** Format a number as South African Rand: R1,250.00 */
export function formatZAR(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Mask contact name: "John Doe" → "John D." */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/** Mask phone number: "0821234567" → "082***4567" */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
}

/** Calculate platform fee on payout amount */
export function calcPlatformFee(payoutAmount: number): number {
  return Math.round(payoutAmount * PLATFORM_FEE_RATE * 100) / 100;
}

/** Total business is charged = payout + 15% fee */
export function calcBusinessCharge(payoutAmount: number): number {
  return payoutAmount + calcPlatformFee(payoutAmount);
}

/** Determine hustler rank from accepted lead count */
export function calcRank(acceptedLeads: number): HustlerRank {
  if (acceptedLeads >= RANK_THRESHOLDS.diamond.min) return "diamond";
  if (acceptedLeads >= RANK_THRESHOLDS.gold.min) return "gold";
  if (acceptedLeads >= RANK_THRESHOLDS.silver.min) return "silver";
  return "bronze";
}

/** Get progress toward next rank (0-100) */
export function rankProgress(acceptedLeads: number): {
  current: HustlerRank;
  next: HustlerRank | null;
  progress: number;
  remaining: number;
} {
  const rank = calcRank(acceptedLeads);
  const thresholds = RANK_THRESHOLDS;

  if (rank === "diamond") {
    return { current: "diamond", next: null, progress: 100, remaining: 0 };
  }

  const levels: HustlerRank[] = ["bronze", "silver", "gold", "diamond"];
  const currentIdx = levels.indexOf(rank);
  const next = levels[currentIdx + 1];
  const currentMin = thresholds[rank].min;
  const nextMin = thresholds[next].min;

  const progress =
    Math.min(
      ((acceptedLeads - currentMin) / (nextMin - currentMin)) * 100,
      100
    );
  const remaining = Math.max(nextMin - acceptedLeads, 0);

  return { current: rank, next, progress, remaining };
}

/** Validate SA phone number format */
export function isValidSAPhone(phone: string): boolean {
  // Accepts: 082 123 4567, 0821234567, +27821234567, 27821234567
  const cleaned = phone.replace(/[\s\-]/g, "");
  return /^(\+27|27|0)[6-8][0-9]{8}$/.test(cleaned);
}

/** Normalize SA phone to 0XXXXXXXXX format */
export function normalizeSAPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, "");
  if (cleaned.startsWith("+27")) return "0" + cleaned.slice(3);
  if (cleaned.startsWith("27")) return "0" + cleaned.slice(2);
  return cleaned;
}

/** Get lead count remaining in a campaign */
export function leadsRemaining(
  leadsNeeded: number,
  leadsReceived: number
): number {
  return Math.max(leadsNeeded - leadsReceived, 0);
}

/** Campaign budget remaining */
export function budgetRemaining(total: number, spent: number): number {
  return Math.max(total - spent, 0);
}

/** Budget spent percentage */
export function budgetPercentage(total: number, spent: number): number {
  if (total === 0) return 0;
  return Math.min((spent / total) * 100, 100);
}

/** Get status badge colors */
export const STATUS_COLORS: Record<
  LeadStatus | CampaignStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
  accepted: { bg: "bg-green-500/20", text: "text-green-400", label: "Accepted" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", label: "Rejected" },
  expired: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Expired" },
  draft: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Draft" },
  active: { bg: "bg-green-500/20", text: "text-green-400", label: "Active" },
  paused: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Paused" },
  completed: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Completed" },
};

export const RANK_COLORS: Record<
  string,
  { gradient: string; text: string; glow: string }
> = {
  bronze: {
    gradient: "from-amber-700 to-amber-600",
    text: "text-amber-600",
    glow: "shadow-amber-700/30",
  },
  silver: {
    gradient: "from-gray-400 to-gray-300",
    text: "text-gray-300",
    glow: "shadow-gray-400/30",
  },
  gold: {
    gradient: "from-yellow-500 to-primary",
    text: "text-primary",
    glow: "shadow-primary/30",
  },
  diamond: {
    gradient: "from-cyan-300 to-blue-400",
    text: "text-cyan-300",
    glow: "shadow-cyan-300/30",
  },
};
