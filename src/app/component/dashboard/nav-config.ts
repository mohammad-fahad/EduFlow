// FILE: src/components/dashboard/nav-config.ts
//
// ── SINGLE SOURCE OF TRUTH FOR NAVIGATION ─────────────────────
// Add/remove items here. Sidebar and any future nav component
// reads from this config — no need to touch Sidebar.tsx.
//
// roles: which AppRole values can see this item.
// isGold: renders the item with gold accent (used for Upgrade CTA).
// badge / badgeVariant: optional notification count.

// ── Role type (mirrors Prisma enum) ──────────────────────────
export type AppRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

// ── Nav item shape ────────────────────────────────────────────
export interface NavItem {
  href:         string;
  labelBn:      string;   // Bangla label (primary)
  labelEn?:     string;   // English hint (optional, shown subdued)
  iconKey:      string;   // Must match a key in Icons object in Sidebar.tsx
  roles:        AppRole[];
  badge?:       number | string;
  badgeVariant?: "blue" | "gold";
  isGold?:      boolean;
}

export interface NavSection {
  sectionKey: string;
  label:      string;     // Section heading text
  items:      NavItem[];
}

// ── Config ────────────────────────────────────────────────────
export const NAV_CONFIG: NavSection[] = [
  {
    sectionKey: "main",
    label: "প্রধান মেনু",
    items: [
      {
        href:    "/dashboard",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        // All authenticated roles see the dashboard home
        roles:   ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        href:    "/dashboard/students",
        labelBn: "শিক্ষার্থী",
        labelEn: "Students",
        iconKey: "Students",
        // Super admin, principal, and teacher can manage students
        roles:   ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        href:    "/dashboard/teachers",
        labelBn: "শিক্ষক",
        labelEn: "Teachers",
        iconKey: "Teachers",
        // Only principal and super admin manage teacher records
        roles:   ["SUPER_ADMIN", "ADMIN"],
      },
      {
        href:    "/dashboard/attendance",
        labelBn: "উপস্থিতি",
        labelEn: "Attendance",
        iconKey: "Attendance",
        // Teachers mark attendance; admins and students/parents can view
        roles:   ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        href:    "/dashboard/fees",
        labelBn: "ফি সংগ্রহ",
        labelEn: "Fees",
        iconKey: "Fees",
        // Fee collection managed by admin; parents can check their child's dues
        roles:   ["SUPER_ADMIN", "ADMIN", "PARENT"],
        badge:   5,
        badgeVariant: "gold",
      },
      {
        href:    "/dashboard/notices",
        labelBn: "নোটিশ",
        labelEn: "Notices",
        iconKey: "Notices",
        // Everyone can read notices; posting is permission-guarded server-side
        roles:   ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
    ],
  },
  {
    sectionKey: "academics",
    label: "একাডেমিক",
    items: [
      {
        href:    "/dashboard/results",
        labelBn: "পরীক্ষার ফলাফল",
        labelEn: "Results",
        iconKey: "Results",
        roles:   ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        href:    "/dashboard/analytics",
        labelBn: "বিশ্লেষণ",
        labelEn: "Analytics",
        iconKey: "Analytics",
        // Analytics only for admin-level and above
        roles:   ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    sectionKey: "admin",
    label: "প্রশাসন",
    items: [
      {
        href:    "/dashboard/institution",
        labelBn: "প্রতিষ্ঠান",
        labelEn: "Institution",
        iconKey: "Institution",
        // Principal manages institution settings; super admin can access all
        roles:   ["SUPER_ADMIN", "ADMIN"],
      },
      {
        href:    "/central-hub",
        labelBn: "সেন্ট্রাল হাব",
        labelEn: "Central Hub",
        iconKey: "CentralHub",
        // Only the platform super admin sees the global multi-tenant hub
        roles:   ["SUPER_ADMIN"],
      },
      {
        href:    "/dashboard/settings",
        labelBn: "সেটিংস",
        labelEn: "Settings",
        iconKey: "Settings",
        roles:   ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    sectionKey: "account",
    label: "অ্যাকাউন্ট",
    items: [
      {
        href:    "/dashboard/upgrade",
        labelBn: "✦ আপগ্রেড করুন",
        labelEn: "Upgrade",
        iconKey: "Upgrade",
        isGold:  true,
        // Upgrade CTA shown to principal; super admin doesn't need it
        roles:   ["ADMIN"],
      },
    ],
  },
];
