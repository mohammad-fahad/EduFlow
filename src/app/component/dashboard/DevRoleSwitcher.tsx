// FILE: src/app/component/dashboard/DevRoleSwitcher.tsx
//
// Floating role-impersonation panel.
//
// SECURITY RULES (enforced here AND server-side):
//  1. Renders ONLY when the authenticated user's real DB role is SUPER_ADMIN.
//  2. Writes __dev_role__ cookie with max-age=86400 and SameSite=Lax.
//  3. After writing the cookie it does a hard window.location.href redirect so
//     the full Next.js layout tree re-mounts with the new role — router.push()
//     alone does NOT re-run server layouts and leaves a stale sidebar.
//  4. __session_role__ is never touched here — it is written only at login time
//     and represents the user's real clearance level.

"use client";

import { useState } from "react";
import { ROLES, ROLE_META, type AppRole } from "@/lib/roles";
import { DEV_ROLE_COOKIE } from "@/lib/get-role";

interface Props {
  /** Normalised kebab-case role from the live DB session e.g. "super-admin" */
  authenticatedRole: AppRole;
  /** The role currently being displayed (may differ if dev override is active) */
  currentRole: AppRole;
}

export function DevRoleSwitcher({ authenticatedRole, currentRole }: Props) {
  // ── Hard guard: only the real SUPER_ADMIN can see this panel ─────────
  // This is a client-side guard complementing the server-side check in
  // DashboardLayout. If authenticatedRole is anything other than
  // "super-admin" this component drops entirely from the DOM —
  // no button, no backdrop, no portal.
  if (authenticatedRole !== "super-admin") return null;

  const [open, setOpen] = useState(false);

  function switchRole(role: AppRole) {
    // Write the override cookie then hard-navigate so all server layouts
    // re-run. router.push() is NOT sufficient — it skips RSC re-renders.
    document.cookie =
      `${DEV_ROLE_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
    window.location.href = ROLE_META[role].dashboardPath;
  }

  function clearDevRole() {
    // Expire the cookie immediately
    document.cookie =
      `${DEV_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    // Return to the real super-admin home
    window.location.href = ROLE_META["super-admin"].dashboardPath;
  }

  const isOverriding = currentRole !== authenticatedRole;

  return (
    <>
      {/* ── Floating trigger ──────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Dev Role Switcher — SUPER_ADMIN only"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xl border border-slate-700 hover:bg-slate-800 transition-colors duration-150"
      >
        <span
          className={[
            "w-2 h-2 rounded-full",
            isOverriding ? "bg-yellow-400 animate-pulse" : "bg-green-400",
          ].join(" ")}
        />
        {isOverriding ? `DEV · ${ROLE_META[currentRole].label}` : "Role Switcher"}
      </button>

      {/* ── Popup panel ──────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop — clicking outside closes panel */}
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-16 right-5 z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Role Impersonation
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Authenticated as{" "}
                <span className="font-bold text-purple-600">SUPER_ADMIN</span>.
                Override is session-scoped (24h).
              </p>
              {isOverriding && (
                <p className="text-[10px] mt-1 text-yellow-600 font-semibold">
                  ⚠ Currently viewing as: {ROLE_META[currentRole].label}
                </p>
              )}
            </div>

            {/* Role list */}
            <div className="p-2 max-h-72 overflow-y-auto">
              {ROLES.map((role) => {
                const meta   = ROLE_META[role];
                const active = role === currentRole;
                const isReal = role === authenticatedRole;
                return (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-100",
                      active
                        ? "bg-slate-100 cursor-default"
                        : "hover:bg-slate-50 cursor-pointer",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "w-2 h-2 rounded-full shrink-0 mt-0.5",
                        active  ? "bg-green-400" : "bg-slate-200",
                      ].join(" ")}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={["text-[13px] font-semibold truncate", meta.color].join(" ")}>
                        {meta.label}
                        {isReal && (
                          <span className="ml-1.5 text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-px rounded-full">
                            REAL
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{meta.description}</p>
                    </div>
                    {active && (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-1">
              {isOverriding && (
                <button
                  onClick={clearDevRole}
                  className="w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-100"
                >
                  ↩ Restore real role (super-admin)
                </button>
              )}
              <button
                onClick={() => {
                  document.cookie = `${DEV_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
                  setOpen(false);
                }}
                className="w-full text-[11px] font-semibold text-rose-500 hover:text-rose-600 py-2 rounded-lg hover:bg-rose-50 transition-colors duration-100"
              >
                ✕ Clear override cookie
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
