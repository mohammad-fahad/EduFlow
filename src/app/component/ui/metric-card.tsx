"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  banglaTitle: string;
  value: string;
  icon: string;
  glowVariant: "blue" | "gold" | "green";
}

export default function MetricCard({
  title,
  banglaTitle,
  value,
  icon,
  glowVariant,
}: MetricCardProps) {
  const glowColors = {
    blue: "shadow-blue-glow",
    gold: "shadow-amber-glow",
    green: "shadow-emerald-glow",
  };

  return (
    <div className={`glass p-4 rounded-xl border border-[var(--color-border)] ${glowColors[glowVariant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-xs font-semibold text-[var(--color-text)]">
            {banglaTitle}
          </p>
        </div>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-lg font-black text-[var(--color-text)] mt-2">
        {value}
      </p>
    </div>
  );
}