// FILE: src/app/component/dashboard/DashboardLayout.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { type AppRole, ROLE_META, prismaRoleToApp } from "@/src/lib/roles";
import { DEV_ROLE_COOKIE } from "@/src/lib/get-role";

const IS_DEV = process.env.NODE_ENV === "development";

const isValidRole = (val: string): val is AppRole => val in ROLE_META;

const NAV: Record<AppRole, { href: string; label: string; icon: string }[]> = {
  "super-admin": [
    { href: "/dashboard/super-admin", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/central-hub", label: "সেন্ট্রাল হাব", icon: "🌐" },
    { href: "/dashboard/institutions", label: "সব প্রতিষ্ঠান", icon: "🏛️" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/students", label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/fees", label: "ফি সংগ্রহ", icon: "৳" },
    { href: "/dashboard/teachers", label: "শিক্ষক", icon: "🧑‍🏫" },
    { href: "/dashboard/notices", label: "নোটিশ", icon: "📢" },
    { href: "/dashboard/institution", label: "প্রতিষ্ঠান", icon: "🏫" },
  ],
  moderator: [
    { href: "/dashboard/moderator", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/students", label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/fees", label: "ফি সংগ্রহ", icon: "৳" },
    { href: "/dashboard/notices", label: "নোটিশ", icon: "📢" },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/students", label: "শিক্ষার্থী", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/notices", label: "নোটিশ", icon: "📢" },
  ],
  parent: [
    { href: "/dashboard/parent", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/fees", label: "আমার ফি", icon: "৳" },
    { href: "/dashboard/notices", label: "নোটিশ", icon: "📢" },
  ],
  student: [
    { href: "/dashboard/student", label: "ওভারভিউ", icon: "📊" },
    { href: "/dashboard/attendance", label: "উপস্থিতি", icon: "⏱️" },
    { href: "/dashboard/notices", label: "নোটিশ", icon: "📢" },
  ],
};

interface Session {
  role: AppRole;
  name: string;
  institutionName: string;
  isDevOverride: boolean;
}

function getDevCookieRole(): AppRole | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${DEV_ROLE_COOKIE}=`));
  if (!match) return null;
  const val = decodeURIComponent(match.split("=")[1] ?? "");
  return isValidRole(val) ? (val as AppRole) : null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (IS_DEV) {
        const devRole = getDevCookieRole();
        if (devRole) {
          if (mounted) {
            setSession({
              role: devRole,
              name: `Dev ${ROLE_META[devRole].label}`,
              institutionName: "EduFlow Dev",
              isDevOverride: true,
            });
            setLoading(false);
          }
          return;
        }
      }
      const {
        data: { session: sb },
      } = await supabase.auth.getSession();
      if (!sb?.user) {
        router.replace("/login");
        return;
      }

      const { data: dbUser } = await supabase
        .from("User")
        .select("role, name, institution:Institution(name)")
        .eq("id", sb.user.id)
        .single();

      if (!mounted) return;
      if (!dbUser) {
        router.replace("/login");
        return;
      }

      const role = prismaRoleToApp(dbUser.role ?? "STUDENT");
      const inst = dbUser.institution as { name?: string } | null;
      setSession({
        role,
        name: dbUser.name ?? sb.user.email ?? "User",
        institutionName: inst?.name ?? "EduFlow",
        isDevOverride: false,
      });
      setLoading(false);
    }
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_OUT") router.replace("/login");
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = useCallback(async () => {
    if (IS_DEV) document.cookie = `${DEV_ROLE_COOKIE}=; path=/; max-age=0`;
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
  const meta = ROLE_META[session.role];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--off-white)]">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center font-black text-slate-950 text-base">
            E
          </div>
          <div>
            <h1 className="text-sm font-black font-display text-white uppercase">
              EduFlow
            </h1>
            <p className="text-[10px] text-slate-400 font-mono-edu truncate max-w-[140px]">
              {session.institutionName}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href.length > 10 && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* DEV ONLY role switcher */}
          {IS_DEV && (
            <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1.5">
                ⚡ Dev Role
              </p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "super-admin",
                    "admin",
                    "moderator",
                    "teacher",
                    "parent",
                    "student",
                  ] as AppRole[]
                ).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      document.cookie = `${DEV_ROLE_COOKIE}=${r}; path=/; SameSite=Lax`;
                      window.location.href = ROLE_META[r].dashboardPath;
                    }}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                      session.role === r
                        ? "bg-yellow-400 text-slate-900"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-[10px] font-bold text-slate-800 shrink-0">
              {session.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">
                {session.name}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                {meta.label}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>সাইন আউট</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto bg-(--off-white) p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
