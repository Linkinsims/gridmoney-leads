"use client";

import { HustlerRank } from "@/types/database";
import { RANK_COLORS, rankProgress } from "@/lib/formatters";
import { clsx } from "clsx";

interface RankBadgeProps {
  rank: HustlerRank;
  acceptedLeads?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

const RANK_EMOJIS: Record<HustlerRank, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

export function RankBadge({
  rank,
  acceptedLeads = 0,
  showProgress = false,
  size = "md",
}: RankBadgeProps) {
  const colors = RANK_COLORS[rank];
  const progressData = showProgress ? rankProgress(acceptedLeads) : null;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border",
          `bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`,
          sizeClasses[size],
          `border-current shadow-lg ${colors.glow}`
        )}
        style={{ borderColor: "currentColor" }}
      >
        <span className="not-italic">{RANK_EMOJIS[rank]}</span>
        <span className={colors.text}>
          {rank.charAt(0).toUpperCase() + rank.slice(1)}
        </span>
      </span>

      {showProgress && progressData && progressData.next && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>{acceptedLeads} accepted</span>
            <span>{progressData.remaining} to {progressData.next}</span>
          </div>
          <div className="w-full bg-surface-border rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
              style={{ width: `${progressData.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
