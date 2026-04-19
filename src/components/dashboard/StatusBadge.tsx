"use client";

import { clsx } from "clsx";
import { STATUS_COLORS } from "@/lib/formatters";
import { LeadStatus, CampaignStatus } from "@/types/database";

interface StatusBadgeProps {
  status: LeadStatus | CampaignStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  if (!colors) return null;

  return (
    <span
      className={clsx(
        "badge",
        colors.bg,
        colors.text,
        className
      )}
    >
      {colors.label}
    </span>
  );
}
