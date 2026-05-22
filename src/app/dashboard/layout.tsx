"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[var(--color-text-muted)] tracking-wider uppercase font-mono-edu">
            অনুমোদন যাচাই করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  const navigation = [
    { href: "/dashboard", label: "ওভারভিউ (Overview)", icon: "📊" },
    { href: "/dashboard/students", label: "শিক্ষার্থী (Students)", icon: "👥" },
    { href: "/dashboard/attendance", label: "উপস্থিতি (Attendance)", icon: "⏱️" },
    { href: "/dashboard/fees", label: "ফি সংগ্রহ (Fees)", icon: "৳" },
    { href: "/dashboard/institution", label: "প্রতিষ্ঠান (Institution)", icon: "🏛️" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--off-white)] text-[var(--color-text)]">
      {/* Sidebar Container */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
        {/* Workspace Brand Block */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-gold)] flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/10 text-base">
            E
          </div>
          <div>
            <h1 className="text-sm font-black font-display tracking-wide text-white uppercase">
              EduFlow SaaS
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider font-mono-edu">
              MANAGEMENT PORTAL
            </p>
          </div>
        </div>

        {/* Unified Application Navigation */}
        <nav className="flex-1 p-4 flex flex-col justify-between gap-6 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10 font-bold"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span className="text-base filter saturate-100">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Secure Workspace Session Destruction Path */}
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all duration-200 border border-transparent hover:border-rose-900/40"
            >
              <span className="text-base">🚪</span>
              <span>সাইন আউট (Sign Out)</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Structural Layout Viewport Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--off-white)] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}