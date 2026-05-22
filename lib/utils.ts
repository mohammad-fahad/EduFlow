// FILE: src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
 
// ── Type helpers ─────────────────────────────────────────────
export type Size    = "sm" | "md" | "lg" | "xl";
export type Variant = "primary" | "secondary" | "gold" | "success" | "danger" | "ghost" | "outline";
 
// ── Accent color map (used across badge, card, alert) ────────
export type AccentColor = "blue" | "gold" | "green" | "silver" | "red";
 
export const accentBg: Record<AccentColor, string> = {
  blue:   "bg-blue-50   text-blue-600",
  gold:   "bg-gold-100  text-gold-600",
  green:  "bg-neon-100  text-neon-600",
  silver: "bg-silver-100 text-silver-600",
  red:    "bg-danger-300/10 text-danger-500",
};
 