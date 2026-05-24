// FILE: src/components/dashboard/nav-config.ts
//
// Sole source of truth for what appears in the sidebar.
// Add items here — Sidebar.tsx reads this file automatically.

import { AppRole } from "@/lib/roles";



export interface NavItem {
  href: string;
  labelBn: string;
  labelEn: string;
  iconKey: string;
  roles: AppRole[]; // which roles can see this item
  badge?: number | string;
  badgeVariant?: "blue" | "gold" | "red";
  isGold?: boolean; // renders gold upgrade CTA style
  external?: boolean;
}

export interface NavSection {
  key: string;
  label: string;
  roles: AppRole[]; // section only renders if role matches
  items: NavItem[];
}

export const NAV_CONFIG: NavSection[] = [
  // ── SUPER ADMIN ONLY ─────────────────────────────────────
  {
    key: "platform",
    label: "প্ল্যাটফর্ম",
    roles: ["super-admin"],
    items: [
      {
        href: "/dashboard/super-admin",
        labelBn: "প্ল্যাটফর্ম ওভারভিউ",
        labelEn: "Platform Overview",
        iconKey: "Overview",
        roles: ["super-admin"],
      },
      {
        href: "/dashboard/central-hub",
        labelBn: "সেন্ট্রাল হাব",
        labelEn: "Central Hub",
        iconKey: "CentralHub",
        roles: ["super-admin"],
      },
      {
        href: "/dashboard/super-admin/institutions",
        labelBn: "সব প্রতিষ্ঠান",
        labelEn: "All Institutions",
        iconKey: "Institution",
        roles: ["super-admin"],
      },
      {
        href: "/dashboard/super-admin/billing",
        labelBn: "বিলিং",
        labelEn: "Billing",
        iconKey: "Fees",
        roles: ["super-admin"],
      },
    ],
  },

  // ── MAIN (all roles) ─────────────────────────────────────
  {
    key: "main",
    label: "প্রধান মেনু",
    roles: ["admin", "moderator", "teacher", "parent", "student"],
    items: [
      {
        href: "/dashboard/admin",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        roles: ["admin"],
      },
      {
        href: "/dashboard/moderator",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        roles: ["moderator"],
      },
      {
        href: "/dashboard/teacher",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        roles: ["teacher"],
      },
      {
        href: "/dashboard/parent",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        roles: ["parent"],
      },
      {
        href: "/dashboard/student",
        labelBn: "ওভারভিউ",
        labelEn: "Overview",
        iconKey: "Overview",
        roles: ["student"],
      },
    ],
  },

  // ── STUDENTS ─────────────────────────────────────────────
  {
    key: "students",
    label: "শিক্ষার্থী ব্যবস্থাপনা",
    roles: ["super-admin", "admin", "moderator", "teacher"],
    items: [
      {
        href: "/dashboard/students",
        labelBn: "শিক্ষার্থী তালিকা",
        labelEn: "Students",
        iconKey: "Students",
        roles: ["super-admin", "admin", "moderator", "teacher"],
      },
      {
        href: "/dashboard/attendance",
        labelBn: "উপস্থিতি",
        labelEn: "Attendance",
        iconKey: "Attendance",
        roles: ["super-admin", "admin", "moderator", "teacher"],
      },
      {
        href: "/dashboard/results",
        labelBn: "ফলাফল",
        labelEn: "Results",
        iconKey: "Results",
        roles: ["super-admin", "admin", "moderator", "teacher"],
      },
    ],
  },

  // ── SELF-SERVICE (student/parent view) ───────────────────
  {
    key: "self",
    label: "আমার তথ্য",
    roles: ["parent", "student"],
    items: [
      {
        href: "/dashboard/attendance",
        labelBn: "উপস্থিতি",
        labelEn: "Attendance",
        iconKey: "Attendance",
        roles: ["parent", "student"],
      },
      {
        href: "/dashboard/results",
        labelBn: "পরীক্ষার ফলাফল",
        labelEn: "Results",
        iconKey: "Results",
        roles: ["parent", "student"],
      },
      {
        href: "/dashboard/fees",
        labelBn: "ফি",
        labelEn: "My Fees",
        iconKey: "Fees",
        roles: ["parent"],
        badge: 2,
        badgeVariant: "gold",
      },
    ],
  },

  // ── FINANCE ──────────────────────────────────────────────
  {
    key: "finance",
    label: "অর্থ ব্যবস্থাপনা",
    roles: ["super-admin", "admin", "moderator"],
    items: [
      {
        href: "/dashboard/fees",
        labelBn: "ফি সংগ্রহ",
        labelEn: "Fee Collection",
        iconKey: "Fees",
        roles: ["super-admin", "admin", "moderator"],
        badge: 5,
        badgeVariant: "gold",
      },
    ],
  },

  // ── COMMUNICATION ────────────────────────────────────────
  {
    key: "comms",
    label: "যোগাযোগ",
    roles: [
      "super-admin",
      "admin",
      "moderator",
      "teacher",
      "parent",
      "student",
    ],
    items: [
      {
        href: "/dashboard/notices",
        labelBn: "নোটিশ",
        labelEn: "Notices",
        iconKey: "Notices",
        roles: [
          "super-admin",
          "admin",
          "moderator",
          "teacher",
          "parent",
          "student",
        ],
      },
    ],
  },

  // ── ANALYTICS ────────────────────────────────────────────
  {
    key: "analytics",
    label: "বিশ্লেষণ",
    roles: ["super-admin", "admin", "moderator"],
    items: [
      {
        href: "/dashboard/analytics",
        labelBn: "বিশ্লেষণ",
        labelEn: "Analytics",
        iconKey: "Analytics",
        roles: ["super-admin", "admin", "moderator"],
      },
    ],
  },

  // ── ADMIN SETTINGS ───────────────────────────────────────
  {
    key: "settings",
    label: "প্রশাসন",
    roles: ["super-admin", "admin"],
    items: [
      {
        href: "/dashboard/teachers",
        labelBn: "শিক্ষক",
        labelEn: "Teachers",
        iconKey: "Teachers",
        roles: ["super-admin", "admin"],
      },
      {
        href: "/dashboard/institution",
        labelBn: "প্রতিষ্ঠান",
        labelEn: "Institution",
        iconKey: "Institution",
        roles: ["super-admin"],
      },
      {
        href: "/dashboard/settings",
        labelBn: "সেটিংস",
        labelEn: "Settings",
        iconKey: "Settings",
        roles: ["super-admin", "admin"],
      },
    ],
  },

  // ── UPGRADE CTA (admin only) ──────────────────────────────
  {
    key: "upgrade",
    label: "",
    roles: ["admin"],
    items: [
      {
        href: "/dashboard/upgrade",
        labelBn: "✦ আপগ্রেড করুন",
        labelEn: "Upgrade Plan",
        iconKey: "Upgrade",
        isGold: true,
        roles: ["admin"],
      },
    ],
  },
];
