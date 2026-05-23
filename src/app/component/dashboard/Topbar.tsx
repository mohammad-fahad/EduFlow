// FILE: src/components/dashboard/Topbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { type AppRole } from "./nav-config";

// ── Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Role-based action buttons ─────────────────────────────────
// Each role gets its own set of contextual CTA buttons in the topbar.
// Add new roles or actions here without touching TopBar layout code.
interface ActionButton {
  label:     string;
  href?:     string;
  onClick?:  () => void;
  variant:   "primary" | "secondary";
}

const ROLE_ACTIONS: Record<AppRole, ActionButton[]> = {
  SUPER_ADMIN: [
    { label: "নতুন প্রতিষ্ঠান",  href: "/central-hub?action=new", variant: "primary"   },
  ],
  ADMIN: [
    { label: "শিক্ষার্থী যোগ",   href: "/dashboard/students?action=new", variant: "primary"   },
    { label: "নোটিশ পোস্ট",      href: "/dashboard/notices?action=new",  variant: "secondary" },
  ],
  TEACHER: [
    { label: "উপস্থিতি নিন",     href: "/dashboard/attendance", variant: "primary" },
  ],
  STUDENT: [],
  PARENT:  [],
};

// ── Breadcrumb label map ──────────────────────────────────────
// Maps URL segment → human-readable Bangla label
const SEGMENT_LABELS: Record<string, string> = {
  dashboard:   "ড্যাশবোর্ড",
  students:    "শিক্ষার্থী",
  teachers:    "শিক্ষক",
  attendance:  "উপস্থিতি",
  fees:        "ফি সংগ্রহ",
  notices:     "নোটিশ",
  results:     "ফলাফল",
  analytics:   "বিশ্লেষণ",
  institution: "প্রতিষ্ঠান",
  settings:    "সেটিংস",
  upgrade:     "আপগ্রেড",
  "central-hub": "সেন্ট্রাল হাব",
};

// ── Props ─────────────────────────────────────────────────────
interface TopbarProps {
  role:              AppRole;
  userName?:         string;
  userInitials?:     string;
  notificationCount?: number;
  onToggleSidebar:   () => void;
}

// ── Component ─────────────────────────────────────────────────
export function Topbar({
  role,
  userName       = "ব্যবহারকারী",
  userInitials   = "?",
  notificationCount = 0,
  onToggleSidebar,
}: TopbarProps) {
  const pathname = usePathname();

  // ── Breadcrumb: derive from pathname ─────────────────────
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      segment: seg,
      label:   SEGMENT_LABELS[seg] ?? seg,
    }));

  // Current page title = last segment
  const pageTitle = segments.at(-1)?.label ?? "ড্যাশবোর্ড";

  // ── Role-filtered CTAs ────────────────────────────────────
  const actions = ROLE_ACTIONS[role] ?? [];

  return (
    <header className="h-[60px] shrink-0 flex items-center gap-3 px-4 md:px-6 bg-white/90 backdrop-blur-md border-b border-silver-200 sticky top-0 z-20">

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-silver-100 transition-colors duration-100 shrink-0"
      >
        <MenuIcon />
      </button>

      <div className="w-px h-5 bg-silver-200 shrink-0" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
        {segments.map((seg, i) => (
          <span key={seg.segment} className="flex items-center gap-1.5">
            {i < segments.length - 1 ? (
              <>
                <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-default">
                  {seg.label}
                </span>
                <span className="text-slate-300">
                  <ChevronRight />
                </span>
              </>
            ) : (
              <span className="font-semibold text-slate-800 truncate">
                {seg.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Mobile: just page title */}
      <span className="sm:hidden font-semibold text-slate-800 text-[14px] truncate flex-1">
        {pageTitle}
      </span>

      <div className="flex-1" />

      {/* Search input — visible md+ */}
      <div className="hidden md:flex items-center gap-2 h-[34px] px-3 bg-silver-100 rounded-lg border border-transparent w-48 focus-within:w-56 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all duration-200">
        <span className="text-slate-400 shrink-0">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="খুঁজুন…"
          aria-label="Search"
          className="bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none w-full"
        />
      </div>

      {/* Role-specific CTA buttons */}
      {/* These change based on role — no conditional rendering spaghetti in the layout */}
      {actions.length > 0 && (
        <div className="hidden sm:flex items-center gap-2">
          {actions.map((action) =>
            action.variant === "primary" ? (
              <a
                key={action.label}
                href={action.href ?? "#"}
                className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 text-white text-[12px] font-semibold shadow-[0_2px_10px_rgba(10,158,245,0.30)] hover:shadow-[0_4px_16px_rgba(10,158,245,0.40)] hover:-translate-y-px transition-all duration-150 whitespace-nowrap"
              >
                <PlusIcon />
                {action.label}
              </a>
            ) : (
              <a
                key={action.label}
                href={action.href ?? "#"}
                className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg bg-white text-slate-700 text-[12px] font-medium ring-1 ring-silver-200 hover:bg-silver-50 hover:ring-silver-300 transition-all duration-150 whitespace-nowrap"
              >
                {action.label}
              </a>
            )
          )}
        </div>
      )}

      {/* Notification bell */}
      <button
        aria-label={`${notificationCount} notifications`}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-silver-100 transition-colors duration-100 shrink-0"
      >
        <BellIcon />
        {/* Live notification dot — only renders when count > 0 */}
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-blue-500 border-[1.5px] border-white shadow-[0_0_6px_rgba(10,158,245,0.7)]" />
        )}
      </button>

      {/* Avatar */}
      <div
        title={userName}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center text-[11px] font-bold font-display text-slate-800 cursor-pointer shadow-sm shrink-0 select-none"
      >
        {userInitials}
      </div>
    </header>
  );
}
