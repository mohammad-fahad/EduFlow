// FILE: src/lib/roles.ts
//
// Single source of truth for every role in the system.
// Prisma schema uses: SUPER_ADMIN | ADMIN | TEACHER | STUDENT | PARENT
// Internal codebase uses lowercase kebab to keep URLs and cookies clean.
// Conversion helpers live at the bottom of this file.

// ── Canonical role type ───────────────────────────────────────
export const ROLES = [
  "super-admin",
  "admin",
  "moderator",
  "teacher",
  "parent",
  "student",
] as const;

export type AppRole = (typeof ROLES)[number];

// ── Role metadata (used by Sidebar, Topbar, switcher UI) ─────
export interface RoleMeta {
  label:       string;   // Human-readable English label
  labelBn:     string;   // Bangla label
  description: string;
  color:       string;   // Tailwind text color class
  badge:       string;   // Tailwind bg+text badge class
  dashboardPath: string; // Home route after login
}

export const ROLE_META: Record<AppRole, RoleMeta> = {
  "super-admin": {
    label:         "Super Admin",
    labelBn:       "সুপার অ্যাডমিন",
    description:   "Full platform access. Manages all institutions.",
    color:         "text-purple-600",
    badge:         "bg-purple-100 text-purple-700",
    dashboardPath: "/dashboard/super-admin",
  },
  admin: {
    label:         "Admin",
    labelBn:       "প্রধান শিক্ষক",
    description:   "Institution principal. Manages all school operations.",
    color:         "text-blue-600",
    badge:         "bg-blue-100 text-blue-700",
    dashboardPath: "/dashboard/admin",
  },
  moderator: {
    label:         "Moderator",
    labelBn:       "মডারেটর",
    description:   "Senior staff. Limited admin access.",
    color:         "text-cyan-600",
    badge:         "bg-cyan-100 text-cyan-700",
    dashboardPath: "/dashboard/moderator",
  },
  teacher: {
    label:         "Teacher",
    labelBn:       "শিক্ষক",
    description:   "Takes attendance, posts results, views classes.",
    color:         "text-green-600",
    badge:         "bg-green-100 text-green-700",
    dashboardPath: "/dashboard/teacher",
  },
  parent: {
    label:         "Parent",
    labelBn:       "অভিভাবক",
    description:   "Views child's attendance, fees, and results.",
    color:         "text-amber-600",
    badge:         "bg-amber-100 text-amber-700",
    dashboardPath: "/dashboard/parent",
  },
  student: {
    label:         "Student",
    labelBn:       "শিক্ষার্থী",
    description:   "Views own attendance, results, and notices.",
    color:         "text-rose-600",
    badge:         "bg-rose-100 text-rose-700",
    dashboardPath: "/dashboard/student",
  },
};

// ── Role hierarchy (higher index = more privilege) ───────────
// Use isAtLeast() for "admin and above" checks.
const ROLE_RANK: Record<AppRole, number> = {
  student:      0,
  parent:       1,
  teacher:      2,
  moderator:    3,
  admin:        4,
  "super-admin": 5,
};

export function getRank(role: AppRole): number {
  return ROLE_RANK[role];
}

export function isAtLeast(role: AppRole, minimum: AppRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

// ── Prisma ↔ AppRole converters ──────────────────────────────
// Prisma schema uses SCREAMING_SNAKE. URLs/cookies use kebab.
const PRISMA_TO_APP: Record<string, AppRole> = {
  SUPER_ADMIN: "super-admin",
  ADMIN:       "admin",
  TEACHER:     "teacher",
  STUDENT:     "student",
  PARENT:      "parent",
  // MODERATOR not yet in Prisma schema — falls through to "teacher"
  MODERATOR:   "moderator",
};

const APP_TO_PRISMA: Record<AppRole, string> = {
  "super-admin": "SUPER_ADMIN",
  admin:         "ADMIN",
  moderator:     "MODERATOR",
  teacher:       "TEACHER",
  parent:        "PARENT",
  student:       "STUDENT",
};

export function prismaRoleToApp(prismaRole: string): AppRole {
  return PRISMA_TO_APP[prismaRole] ?? "student";
}

export function appRoleToPrisma(role: AppRole): string {
  return APP_TO_PRISMA[role];
}

// ── Type guard ────────────────────────────────────────────────
export function isValidRole(value: unknown): value is AppRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export const DEFAULT_ROLE: AppRole = "student";
