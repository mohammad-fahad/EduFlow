// FILE: src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type AppRole, ROLE_META } from "@/src/lib/roles";
import { NAV_CONFIG, type NavItem } from "./nav-config";
import { JSX } from "react";


// ── Inline SVG icons (no dependency) ─────────────────────────
const ICONS: Record<string, () => JSX.Element> = {
  Overview:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Students:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Teachers:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  Attendance:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>,
  Fees:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Results:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Notices:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Analytics:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Institution: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  CentralHub:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  Settings:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Upgrade:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Signout:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NavIcon = ({ iconKey }: { iconKey: string }) => {
  const Icon = ICONS[iconKey] ?? ICONS.Overview;
  return <Icon />;
};

// ── Badge color ───────────────────────────────────────────────
const BADGE_CLASS: Record<string, string> = {
  blue: "bg-blue-500 text-white",
  gold: "bg-yellow-400 text-slate-800",
  red:  "bg-red-500 text-white",
};

// ── Single nav link ───────────────────────────────────────────
function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      title={collapsed ? `${item.labelBn} (${item.labelEn})` : undefined}
      className={[
        "relative group flex items-center rounded-lg px-3 py-[9px] text-[13px] transition-colors duration-100 select-none",
        collapsed ? "justify-center px-0 w-10 mx-auto" : "gap-2.5",
        isActive && !item.isGold && "bg-blue-50 text-blue-600 font-semibold",
        isActive && item.isGold && "bg-yellow-50 text-yellow-700 font-semibold",
        !isActive &&
          !item.isGold &&
          "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
        !isActive && item.isGold && "text-yellow-600 hover:bg-yellow-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Active indicator pill */}
      {isActive && (
        <span
          className={[
            "absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full",
            item.isGold ? "bg-yellow-400" : "bg-blue-400",
          ].join(" ")}
        />
      )}

      <span
        className={[
          "w-[18px] shrink-0 flex items-center justify-center transition-colors duration-100",
          isActive && !item.isGold && "text-blue-500",
          isActive && item.isGold && "text-yellow-500",
          !isActive && "text-slate-400 group-hover:text-slate-600",
          !isActive && item.isGold && "!text-yellow-500",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <NavIcon iconKey={item.iconKey} />
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate leading-none">
            {item.labelBn}
            {item.labelEn && (
              <span className="ml-1 text-[10px] font-normal opacity-40">
                {item.labelEn}
              </span>
            )}
          </span>
          {item.badge != null && (
            <span
              className={[
                "text-[10px] font-bold px-1.5 py-px rounded-full leading-none shrink-0",
                BADGE_CLASS[item.badgeVariant ?? "blue"],
              ].join(" ")}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ── Props ─────────────────────────────────────────────────────
interface SidebarProps {
  role:             AppRole;
  collapsed:        boolean;
  userName?:        string;
  userInitials?:    string;
  institutionName?: string;
  onSignOut:        () => void;
}

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar({
  role,
  collapsed,
  userName = "ব্যবহারকারী",
  userInitials = "?",
  institutionName,
  onSignOut,
}: SidebarProps) {
  // const meta = ROLE_META[role];

  // Filter sections and items by role
  const visibleSections = NAV_CONFIG.filter((s) => s.roles.includes(role))
    .map((s) => ({
      ...s,
      items: s.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <aside
      className={[
        "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-out overflow-hidden shrink-0",
        collapsed ? "w-[64px]" : "w-[240px]",
      ].join(" ")}
    >
      {/* Logo */}
      <div
        className={[
          "h-[60px] flex items-center gap-3 border-b border-slate-100 shrink-0",
          collapsed ? "px-[17px]" : "px-5",
        ].join(" ")}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(10,158,245,0.35)]">
          <span className="font-display font-black text-[14px] text-white leading-none">
            E
          </span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-[16px] tracking-tight text-slate-800 leading-none">
              Edu<span className="text-blue-400">flow</span>
            </p>
            {institutionName && (
              <p className="text-[10px] text-slate-400 truncate mt-0.5 tracking-wide">
                {institutionName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2"
        aria-label="Main navigation"
      >
        {visibleSections.map((section) => (
          <div key={section.key} className="mb-1">
            {section.label &&
              (!collapsed ? (
                <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap select-none">
                  {section.label}
                </p>
              ) : (
                <div className="my-2 mx-3 h-px bg-slate-100" />
              ))}
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-2 space-y-1 shrink-0">
        {/* Role badge */}
        {!collapsed && (
          <div className="px-3 py-2 flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shrink-0 text-[11px] font-bold text-slate-800">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-800 truncate leading-none">
                {userName}
              </p>
              <span
                className={[
                  "text-[9px] font-bold uppercase tracking-widest",
                  ROLE_META[role].color,
                ].join(" ")}
              >
                {ROLE_META[role].label}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onSignOut}
          title={collapsed ? "সাইন আউট" : undefined}
          className={[
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-100 cursor-pointer",
            collapsed && "justify-center px-0",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="w-[18px] shrink-0 flex items-center justify-center">
            <ICONS.Signout />
          </span>
          {!collapsed && <span className="truncate">সাইন আউট</span>}
        </button>
      </div>
    </aside>
  );
}
