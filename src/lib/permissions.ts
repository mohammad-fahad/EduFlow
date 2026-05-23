// FILE: src/lib/permissions.ts
//
// Feature-level permission matrix.
// Components and server actions call can(role, feature) or assert(role, feature).
// Never scatter role checks inline — add them here and reference by key.

import { type AppRole, isAtLeast } from "./roles";

// ── Permission keys ───────────────────────────────────────────
// Add a new key when you add a new feature. Keep keys descriptive.
export const PERMISSION_KEYS = [
  // Institution management
  "institution:view",
  "institution:edit",
  "institution:create",
  "institution:delete",

  // Student management
  "students:view",
  "students:create",
  "students:edit",
  "students:delete",
  "students:export",

  // Teacher management
  "teachers:view",
  "teachers:create",
  "teachers:edit",
  "teachers:delete",

  // Attendance
  "attendance:view",
  "attendance:mark",
  "attendance:edit",
  "attendance:export",

  // Fees
  "fees:view",
  "fees:collect",
  "fees:waive",
  "fees:export",
  "fees:view-own",        // parent/student can see their own

  // Results
  "results:view",
  "results:publish",
  "results:edit",
  "results:view-own",

  // Notices
  "notices:view",
  "notices:create",
  "notices:delete",

  // Analytics
  "analytics:view",
  "analytics:export",

  // Platform (super-admin only)
  "platform:manage-institutions",
  "platform:billing",
  "platform:impersonate",

  // Settings
  "settings:view",
  "settings:edit",
] as const;

export type Permission = (typeof PERMISSION_KEYS)[number];

// ── Permission matrix ─────────────────────────────────────────
// true  = allowed
// false = denied (explicit)
// undefined treated as false
type Matrix = Partial<Record<Permission, boolean>>;

const PERMISSIONS: Record<AppRole, Matrix> = {
  "super-admin": {
    // Super admin can do everything — use isAtLeast checks in helpers
    "institution:view":              true,
    "institution:edit":              true,
    "institution:create":            true,
    "institution:delete":            true,
    "students:view":                 true,
    "students:create":               true,
    "students:edit":                 true,
    "students:delete":               true,
    "students:export":               true,
    "teachers:view":                 true,
    "teachers:create":               true,
    "teachers:edit":                 true,
    "teachers:delete":               true,
    "attendance:view":               true,
    "attendance:mark":               true,
    "attendance:edit":               true,
    "attendance:export":             true,
    "fees:view":                     true,
    "fees:collect":                  true,
    "fees:waive":                    true,
    "fees:export":                   true,
    "results:view":                  true,
    "results:publish":               true,
    "results:edit":                  true,
    "notices:view":                  true,
    "notices:create":                true,
    "notices:delete":                true,
    "analytics:view":                true,
    "analytics:export":              true,
    "platform:manage-institutions":  true,
    "platform:billing":              true,
    "platform:impersonate":          true,
    "settings:view":                 true,
    "settings:edit":                 true,
  },

  admin: {
    "institution:view":   true,
    "institution:edit":   true,
    "students:view":      true,
    "students:create":    true,
    "students:edit":      true,
    "students:delete":    true,
    "students:export":    true,
    "teachers:view":      true,
    "teachers:create":    true,
    "teachers:edit":      true,
    "teachers:delete":    true,
    "attendance:view":    true,
    "attendance:mark":    true,
    "attendance:edit":    true,
    "attendance:export":  true,
    "fees:view":          true,
    "fees:collect":       true,
    "fees:waive":         true,
    "fees:export":        true,
    "results:view":       true,
    "results:publish":    true,
    "results:edit":       true,
    "notices:view":       true,
    "notices:create":     true,
    "notices:delete":     true,
    "analytics:view":     true,
    "analytics:export":   true,
    "settings:view":      true,
    "settings:edit":      true,
  },

  moderator: {
    "students:view":      true,
    "students:create":    true,
    "students:edit":      true,
    "teachers:view":      true,
    "attendance:view":    true,
    "attendance:mark":    true,
    "attendance:edit":    true,
    "attendance:export":  true,
    "fees:view":          true,
    "fees:collect":       true,
    "fees:export":        true,
    "results:view":       true,
    "results:publish":    true,
    "notices:view":       true,
    "notices:create":     true,
    "analytics:view":     true,
    "settings:view":      true,
  },

  teacher: {
    "students:view":      true,
    "attendance:view":    true,
    "attendance:mark":    true,
    "results:view":       true,
    "results:publish":    true,
    "results:edit":       true,
    "notices:view":       true,
    "notices:create":     true,
  },

  parent: {
    "attendance:view":    true,
    "fees:view-own":      true,
    "results:view-own":   true,
    "notices:view":       true,
  },

  student: {
    "attendance:view":    true,
    "results:view-own":   true,
    "notices:view":       true,
  },
};

// ── Public API ────────────────────────────────────────────────

/** Returns true if the role has the given permission. */
export function can(role: AppRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.[permission] === true;
}

/**
 * Returns true if role has the permission OR is at least `minimumRole`.
 * Useful for "admin or above can do X" patterns.
 */
export function canOrAbove(
  role: AppRole,
  permission: Permission,
  minimumRole: AppRole
): boolean {
  return can(role, permission) || isAtLeast(role, minimumRole);
}

/**
 * Server-side guard. Throws a structured error if permission denied.
 * Use in Server Actions and Route Handlers.
 */
export function assertPermission(role: AppRole, permission: Permission): void {
  if (!can(role, permission)) {
    throw new PermissionError(role, permission);
  }
}

export class PermissionError extends Error {
  constructor(
    public readonly role: AppRole,
    public readonly permission: Permission
  ) {
    super(`Role "${role}" does not have permission "${permission}"`);
    this.name = "PermissionError";
  }
}

/** Returns all permissions granted to a role (for debugging/dev switcher). */
export function getGrantedPermissions(role: AppRole): Permission[] {
  return (Object.entries(PERMISSIONS[role] ?? {}) as [Permission, boolean][])
    .filter(([, v]) => v === true)
    .map(([k]) => k);
}
