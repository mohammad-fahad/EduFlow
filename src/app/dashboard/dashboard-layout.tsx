"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Icons (inline SVG — cleanly preserved with zero third-party dependencies) ───────────────
const Icon = {
  Grid: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/>
      <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
      <path d="M8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      <path d="M16 13c-.29 0-.62.02-.97.05C16.19 13.72 17 14.7 17 17v2h7v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  ClipboardCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  BookOpen: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Bell: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

type NavItem = {
  label: string;
  banglaLabel: string;
  href: string;
  icon: React.FC;
  badge?: string | number;
  badgeColor?: "blue" | "gold";
  section: "Main" | "Academics" | "Account";
};

const NAV: NavItem[] = [
  { label: "Dashboard",   banglaLabel: "ওভারভিউ",         href: "/dashboard",            icon: Icon.Grid,           section: "Main" },
  { label: "Students",    banglaLabel: "শিক্ষার্থী তালিকা",   href: "/dashboard/students",   icon: Icon.Users,          badge: 342, section: "Main" },
  { label: "Attendance",  banglaLabel: "দৈনিক হাজিরা",     href: "/dashboard/attendance", icon: Icon.ClipboardCheck, section: "Main" },
  { label: "Fees",        banglaLabel: "ফি সংগ্রহ",       href: "/dashboard/fees",       icon: Icon.CreditCard,     badge: 5, badgeColor: "gold", section: "Main" },
  { label: "Classes",     banglaLabel: "ক্লাস ও জামাত",     href: "/dashboard/classes",    icon: Icon.BookOpen,       section: "Academics" },
  { label: "Analytics",   banglaLabel: "প্রতিবেদন রিপোর্ট",   href: "/dashboard/analytics",  icon: Icon.BarChart,       section: "Academics" },
  { label: "Upgrade",     banglaLabel: "প্রিমিয়াম আপগ্রেড",   href: "/dashboard/upgrade",    icon: Icon.Star,           section: "Account" },
  { label: "Settings",    banglaLabel: "সেটিংস প্যানেল",    href: "/dashboard/settings",   icon: Icon.Settings,       section: "Account" },
];

// ── Sidebar Component ───────────────────────────────────────────
function Sidebar({
  pathname,
  onCloseMobile,
  collapsed,
}: {
  pathname: string;
  onCloseMobile: () => void;
  collapsed: boolean;
}) {
  const sections: ("Main" | "Academics" | "Account")[] = ["Main", "Academics", "Account"];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200",
        "transition-all duration-300 ease-out overflow-hidden",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Brand Identity */}
      <div className={cn("h-[60px] flex items-center gap-3 px-5 border-b border-slate-100 shrink-0", collapsed && "px-[16px]")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-blue-glow">
          <span className="font-display font-black text-[14px] text-white leading-none">E</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-[17px] tracking-tight text-slate-800 whitespace-nowrap">
            Edu<span className="text-blue-500">flow</span>
          </span>
        )}
      </div>

      {/* Nav Link Tree */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-4">
        {sections.map((section) => (
          <div key={section}>
            {!collapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap">
                {section === "Main" ? "প্রধান মেনু" : section === "Academics" ? "একাডেমিক" : "অ্যাকাউন্ট"}
              </p>
            )}
            {collapsed && <div className="my-2 mx-2 h-px bg-slate-100" />}

            <div className="space-y-0.5">
              {NAV.filter((n) => n.section === section).map((item) => {
                const active = pathname === item.href;
                const isGold = item.label === "Upgrade";
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] transition-all relative group",
                      active && !isGold && "bg-blue-50 text-blue-600 font-bold shadow-sm",
                      active && isGold  && "bg-amber-50 text-amber-600 font-bold shadow-sm",
                      !active && !isGold && "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      !active && isGold  && "text-amber-600 hover:bg-amber-50/60"
                    )}
                  >
                    {active && (
                      <span className={cn("absolute left-0 top-[25%] bottom-[25%] w-[3px] rounded-r-full", isGold ? "bg-amber-500" : "bg-blue-500")} />
                    )}

                    <span className={cn("shrink-0 w-5 h-5 flex items-center justify-center transition-colors", active && !isGold ? "text-blue-500" : active && isGold ? "text-amber-500" : "text-slate-400 group-hover:text-slate-600")}>
                      <item.icon />
                    </span>

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate font-medium">
                          {item.banglaLabel}
                        </span>
                        {item.badge != null && (
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none scale-90", item.badgeColor === "gold" ? "bg-amber-500 text-white" : "bg-blue-500 text-white")}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="border-t border-slate-100 p-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-[11px] font-bold text-white font-display">
            AH
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-800 truncate">মাওঃ হাসান</p>
              <p className="text-[11px] font-medium text-slate-400 truncate">Principal Account</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Topbar Component ────────────────────────────────────────────
function Topbar({
  currentLabel,
  onToggleSidebar,
}: {
  currentLabel: string;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="h-[60px] shrink-0 flex items-center gap-4 px-5 bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
      <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-800 transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100" aria-label="Toggle sidebar">
        <Icon.Menu />
      </button>

      <div className="w-px h-5 bg-slate-200" />

      <div className="flex items-center gap-1.5 text-[13px] font-medium">
        <span className="text-slate-400">Eduflow</span>
        <span className="text-slate-300"><Icon.ChevronRight /></span>
        <span className="text-slate-800 font-bold">{currentLabel}</span>
      </div>

      <div className="flex-1" />

      {/* Bell Notification */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
        <Icon.Bell />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(10,158,245,0.7)]" />
      </button>
    </header>
  );
}

// ── Main Layout Frame Switcher ──────────────────────────────────────────
export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);       // Mobile tracking drawers
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop toggles

  // Extract translation mapping directly for breadcrumb displays
  const activeNode = NAV.find((n) => n.href === pathname) || NAV[0];

  return (
    <div className="flex h-screen bg-[#F8F8F6] overflow-hidden font-bangla">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-all" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Structural Node */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 lg:static lg:z-auto",
          "transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Mobile close banner */}
        <div className="absolute top-3 right-[-42px] lg:hidden">
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-md border border-slate-100">
            <Icon.X />
          </button>
        </div>

        <Sidebar pathname={pathname} onCloseMobile={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} />
      </div>

      {/* Main Structural Layout Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          currentLabel={activeNode.banglaLabel}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setSidebarOpen((v) => !v);
            } else {
              setSidebarCollapsed((v) => !v);
            }
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8F8F6]">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;