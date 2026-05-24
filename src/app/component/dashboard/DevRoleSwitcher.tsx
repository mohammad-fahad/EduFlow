// FILE: src/components/dashboard/DevRoleSwitcher.tsx
//
// DEV ONLY — floating panel to switch roles without touching the database.
// Sets ?role= param which the middleware converts to __dev_role__ cookie.
// Strips itself from production builds via process.env.NODE_ENV check.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, ROLE_META, type AppRole } from "@/lib/roles";
import { DEV_ROLE_COOKIE } from "@/lib/get-role";

interface Props {
  currentRole: AppRole;
}

export function DevRoleSwitcher({ currentRole }: Props) {
  // Hard guard: renders nothing outside development
  if (process.env.NODE_ENV !== "development") return null;

  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchRole(role: AppRole) {
    // Navigate with ?role= — middleware handles setting the cookie
    // and redirects to the role's dashboard home
    const target = ROLE_META[role].dashboardPath;
    router.push(`${target}?role=${role}`);
    setOpen(false);
  }

  function clearDevRole() {
    document.cookie = `${DEV_ROLE_COOKIE}=; path=/; max-age=0`;
    router.push("/login");
  }

  const current = ROLE_META[currentRole];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Dev Role Switcher"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xl border border-slate-700 hover:bg-slate-800 transition-colors duration-150"
      >
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        DEV · {current.label}
      </button>

      {/* Popup panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-16 right-5 z-50 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Dev Role Switcher
              </p>
              <p className="text-[12px] text-slate-600 mt-0.5">
                Only visible in <code className="bg-slate-200 px-1 rounded text-[10px]">development</code>
              </p>
            </div>

            {/* Role list */}
            <div className="p-2">
              {ROLES.map((role) => {
                const meta   = ROLE_META[role];
                const active = role === currentRole;
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
                    <span className={["w-2 h-2 rounded-full shrink-0", active ? "bg-green-400" : "bg-slate-300"].join(" ")} />
                    <div className="flex-1 min-w-0">
                      <p className={["text-[13px] font-semibold truncate", meta.color].join(" ")}>
                        {meta.label}
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
            <div className="px-3 pb-3 pt-1 border-t border-slate-100">
              <button
                onClick={clearDevRole}
                className="w-full text-[11px] font-semibold text-rose-500 hover:text-rose-600 py-2 rounded-lg hover:bg-rose-50 transition-colors duration-100"
              >
                ✕ Clear dev cookie & go to login
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
