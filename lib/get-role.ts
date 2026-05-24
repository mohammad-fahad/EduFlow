// FILE: lib/get-role.ts
// CLIENT-SAFE — no next/headers, no server-only APIs

// FIX: re-export isValidRole so DashboardLayout can import from one place
export { isValidRole, type AppRole } from "./roles";

export const DEV_ROLE_COOKIE    = "__dev_role__";
export const SESSION_ROLE_COOKIE = "__session_role__";

export interface ResolvedSession {
  role:            import("./roles").AppRole;
  userId:          string | null;
  email:           string | null;
  name:            string | null;
  institutionId:   string | null;
  institutionName: string | null;
  isDevOverride:   boolean;
}

type AllowedRole =
  | "super-admin"
  | "admin"
  | "moderator"
  | "teacher"
  | "parent"
  | "student";

function isValidRole(role: string): role is AllowedRole {
  return [
    "super-admin",
    "admin",
    "moderator",
    "teacher",
    "parent",
    "student",
  ].includes(role);
}

export function getRoleFromCookie(cookieString: string): AllowedRole | null {
  const cookies = cookieString.split(";");
  for (const cookie of cookies) {
    const match = cookie.trim().match(/^role=/);
    if (match) {
      const val = decodeURIComponent(cookie.split("=")[1] ?? "");
      if (isValidRole(val)) {
        return val;
      }
    }
  }
  return null;
}

export const PROTECTED_ROUTES: Record<string, import("./roles").AppRole> = {
  "/dashboard/super-admin": "super-admin",
  "/dashboard/admin":       "admin",
  "/dashboard/moderator":   "moderator",
  "/dashboard/teacher":     "teacher",
  "/dashboard/parent":      "parent",
  "/dashboard/student":     "student",
};

export function canAccessRoute(role: import("./roles").AppRole, pathname: string): boolean {
  const required = PROTECTED_ROUTES[pathname];
  if (!required) return true;
  if (role === "super-admin") return true;
  return role === required;
}
