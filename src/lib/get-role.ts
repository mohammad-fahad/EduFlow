// FILE: src/lib/get-role.ts
// CLIENT-SAFE — no next/headers, no server-only APIs
// Types and constants shared between client + server

import { isValidRole, type AppRole } from "./roles";

export const DEV_ROLE_COOKIE = "__dev_role__";
export const SESSION_ROLE_COOKIE = "__session_role__";

export interface ResolvedSession {
  role: AppRole;
  userId: string | null;
  email: string | null;
  name: string | null;
  institutionId: string | null;
  institutionName: string | null;
  isDevOverride: boolean;
}

// Used by middleware (raw cookie string, no next/headers)
export function getRoleFromCookies(
  cookieHeader: string | null,
): AppRole | null {
  if (!cookieHeader) return null;
  for (const name of [DEV_ROLE_COOKIE, SESSION_ROLE_COOKIE]) {
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    if (match) {
      const val = decodeURIComponent(match.split("=")[1] ?? "");
      if (isValidRole(val)) return val;
    }
  }
  return null;
}

export const PROTECTED_ROUTES: Record<string, AppRole> = {
  "/dashboard/super-admin": "super-admin",
  "/dashboard/admin": "admin",
  "/dashboard/moderator": "moderator",
  "/dashboard/teacher": "teacher",
  "/dashboard/parent": "parent",
  "/dashboard/student": "student",
};

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const required = PROTECTED_ROUTES[pathname];
  if (!required) return true;
  if (role === "super-admin") return true;
  return role === required;
}
