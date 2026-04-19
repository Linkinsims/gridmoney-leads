"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface StatsCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  delta?: { value: string; positive: boolean };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-primary",
  delta,
}: StatsCardProps) {
  return (
    <div className="stats-card group hover:border-primary/20 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtitle && (
            <p className="text-text-muted text-xs mt-1">{subtitle}</p>
          )}
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={clsx(
                  "text-xs font-medium",
                  delta.positive ? "text-success" : "text-error"
                )}
              >
                {delta.positive ? "↑" : "↓"} {delta.value}
              </span>
              <span className="text-text-muted text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-surface-hover",
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
