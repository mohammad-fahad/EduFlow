// FILE: src/app/component/dashboard/DashboardLayout.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { type AppRole, ROLE_META, prismaRoleToApp, isValidRole } from "@/lib/roles";
import { DEV_ROLE_COOKIE, SESSION_ROLE_COOKIE, parseCookies } from "@/lib/get-role";
import { DevRoleSwitcher } from "./DevRoleSwitcher";

const NAV: Record<AppRole, { href: string; label: string; icon: string }[]> = {
  "super-admin": [
    { href: "/dashboard/super-admin",  label: "ওভারভিউ",       icon: "📊" },
    { href: "/dashboard/central-hub",  label: "সেন্ট্রাল হাব", icon: "🌐" },
    { href: "/dashboard/institutions", label: "সব প্রতিষ্ঠান", icon: "🏛️" },
  ],
  admin: [
    { href: "/dashboard/admin",       label: "ওভারভিউ",   icon: "📊" },
    { href: "/dashboard/students",    label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance",  label: "উপস্থিতি",  icon: "⏱️" },
    { href: "/dashboard/fees",        label: "ফি সংগ্রহ", icon: "৳"  },
    { href: "/dashboard/teachers",    label: "শিক্ষক",    icon: "🧑‍🏫"},
    { href: "/dashboard/notices",     label: "নোটিশ",     icon: "📢" },
    { href: "/dashboard/admin/users", label: "ব্যবহারকারী", icon: "🔑" },
    { href: "/dashboard/institution", label: "প্রতিষ্ঠান",  icon: "🏫" },
  ],
  moderator: [
    { href: "/dashboard/moderator",  label: "ওভারভিউ",   icon: "📊" },
    { href: "/dashboard/students",   label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি",  icon: "⏱️" },
    { href: "/dashboard/fees",       label: "ফি সংগ্রহ", icon: "৳"  },
    { href: "/dashboard/notices",    label: "নোটিশ",     icon: "📢" },
  ],
  teacher: [
    { href: "/dashboard/teacher",    label: "ওভারভিউ",   icon: "📊" },
    { href: "/dashboard/students",   label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি",  icon: "⏱️" },
    { href: "/dashboard/notices",    label: "নোটিশ",     icon: "📢" },
  ],
  parent: [
    { href: "/dashboard/parent",     label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/fees",       label: "আমার ফি",  icon: "৳"  },
    { href: "/dashboard/notices",    label: "নোটিশ",    icon: "📢" },
  ],
  student: [
    { href: "/dashboard/student",    label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/notices",    label: "নোটিশ",    icon: "📢" },
  ],
};

interface SessionState {
  /** The role currently shown in the UI (may be dev-overridden) */
  role:              AppRole;
  /** The real DB role of the authenticated user — never changes during impersonation */
  authenticatedRole: AppRole;
  name:              string;
  institutionName:   string;
  isDevOverride:     boolean;
}

// Reads __dev_role__ from document.cookie — client-side only.
// Only returns a value if __session_role__ is also "super-admin".
function getDevOverrideRole(): AppRole | null {
  if (typeof document === "undefined") return null;
  const cookies = parseCookies(document.cookie);

  const sessionRaw = cookies[SESSION_ROLE_COOKIE];
  const devRaw     = cookies[DEV_ROLE_COOKIE];

  if (!devRaw || !sessionRaw) return null;

  const sessionKebab = sessionRaw.toLowerCase().replace(/_/g, "-");
  if (sessionKebab !== "super-admin") return null; // only SUPER_ADMIN may override

  const devKebab = devRaw.toLowerCase().replace(/_/g, "-");
  return isValidRole(devKebab) ? devKebab : null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // ── getUser() not getSession() — validates JWT server-side ────────
      const { data: { user: authUser }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authUser) {
        router.replace("/login");
        return;
      }

      const { data: dbUser, error: dbError } = await supabase
        .from("User")
        .select("role, name, institutionId")
        .eq("id", authUser.id)
        .single();

      if (!mounted) return;

      if (dbError || !dbUser) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const authenticatedRole = prismaRoleToApp(dbUser.role ?? "STUDENT");

      // Write __session_role__ so middleware and getRoleFromCookies() can
      // determine the real clearance level without a DB round-trip.
      // Value stored as UPPERCASE to match DB convention.
      document.cookie =
        `${SESSION_ROLE_COOKIE}=${dbUser.role}; path=/; max-age=86400; SameSite=Lax`;

      // Check for a valid dev override (only SUPER_ADMIN can have one)
      const devOverride = getDevOverrideRole();
      const effectiveRole = devOverride ?? authenticatedRole;

      let institutionName = "EduFlow";
      if (dbUser.institutionId) {
        const { data: inst } = await supabase
          .from("Institution")
          .select("name")
          .eq("id", dbUser.institutionId)
          .single();
        if (inst?.name) institutionName = inst.name;
      }

      setSession({
        role:              effectiveRole,
        authenticatedRole,
        name:              dbUser.name ?? authUser.email ?? "User",
        institutionName,
        isDevOverride:     !!devOverride,
      });
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(e => {
      if (e === "SIGNED_OUT") router.replace("/login");
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router]);

  const signOut = useCallback(async () => {
    // Clear both role cookies on sign-out
    document.cookie = `${DEV_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${SESSION_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = NAV[session.role] ?? NAV.student;
  const meta     = ROLE_META[session.role];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--off-white)]">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center font-black text-slate-950 text-base">
            E
          </div>
          <div>
            <h1 className="text-sm font-black font-display text-white uppercase">EduFlow</h1>
            <p className="text-[10px] text-slate-400 font-mono-edu truncate max-w-[140px]">
              {session.institutionName}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href ||
              (item.href.length > 10 && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {session.isDevOverride && (
            <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">
                ⚡ Impersonating: {ROLE_META[session.role].label}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-[10px] font-bold text-slate-800 shrink-0">
              {session.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{session.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{meta.label}</p>
            </div>
          </div>

          <button onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer">
            <span>🚪</span><span>সাইন আউট</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--off-white)] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* DevRoleSwitcher: internally guards itself — renders null if not SUPER_ADMIN */}
      <DevRoleSwitcher
        authenticatedRole={session.authenticatedRole}
        currentRole={session.role}
      />
    </div>
  );
}
