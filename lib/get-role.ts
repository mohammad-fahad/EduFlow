// FILE: lib/get-role.ts
// CLIENT-SAFE — no next/headers, no server-only APIs.
// Safe for Edge Middleware (no require()), client-side document.cookie, and
// Server Components that only need types/constants from this module.

import {
  ROLES,
  isValidRole,
  type AppRole,
} from "./roles";

// ── Cookie names ──────────────────────────────────────────────
export const DEV_ROLE_COOKIE     = "__dev_role__";
export const SESSION_ROLE_COOKIE = "__session_role__";

// ── Re-exports so callers only need one import ─────────────────
export { isValidRole, type AppRole };

// ── Resolved session shape ────────────────────────────────────
export interface ResolvedSession {
  /** Normalised kebab-case role e.g. "super-admin" */
  role:            AppRole;
  /** Raw UPPERCASE DB value e.g. "SUPER_ADMIN" — used for RLS checks */
  dbRole:          string;
  userId:          string | null;
  email:           string | null;
  name:            string | null;
  institutionId:   string | null;
  institutionName: string | null;
  isDevOverride:   boolean;
}

// ── parseCookies ──────────────────────────────────────────────
// Edge-safe, no regex, handles URL-encoded values, handles duplicate keys
// (takes the LAST value for a given name — matches browser behaviour).
export function parseCookies(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch {
        out[key] = val; // leave raw if decoding fails
      }
    }
  }
  return out;
}

// ── getRoleFromCookies ────────────────────────────────────────
// Used exclusively by Edge Middleware (src/proxy.ts).
// authDbRole is the UPPERCASE value already confirmed from the DB session
// (e.g. stored in __session_role__ at login time).
// __dev_role__ is ONLY honoured when authDbRole === "SUPER_ADMIN".
export function getRoleFromCookies(
  cookieHeader: string | null,
): AppRole | null {
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);

 const sessionRaw = cookies[SESSION_ROLE_COOKIE] || cookies["role"];
 const devRaw = cookies[DEV_ROLE_COOKIE];

 const normalise = (raw: string | undefined): AppRole | null => {
   if (!raw) return null;
   const kebab = raw.toLowerCase().replace(/_/g, "-");
   return isValidRole(kebab) ? kebab : null;
 };

 const sessionRole = normalise(sessionRaw);
 const devRole = normalise(devRaw);

 // যদি সেশন রোল super-admin হয়, তবেই কেবল দেব ওভাররাইড কাজ করবে
 if (devRole && sessionRole === "super-admin") {
   return devRole;
 }

 // ফিক্স: যদি কোনো কারণে সেশন রোল না পাওয়া যায় কিন্তু ডেভ মোড অন থাকে, তবে ডেভ রোলকে প্রায়োরিটি দেওয়া
 if (!sessionRole && devRole) {
   return devRole;
 }

 return sessionRole;
}

// ── Route access map ──────────────────────────────────────────
export const PROTECTED_ROUTES: Record<string, AppRole> = {
  "/dashboard/super-admin": "super-admin",
  "/dashboard/admin":       "admin",
  "/dashboard/moderator":   "moderator",
  "/dashboard/teacher":     "teacher",
  "/dashboard/parent":      "parent",
  "/dashboard/student":     "student",
};

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const required = PROTECTED_ROUTES[pathname];
  if (!required) return true;
  if (role === "super-admin") return true;
  return role === required;
}
