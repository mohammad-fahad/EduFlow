// FILE: src/components/dashboard/Topbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { type AppRole, ROLE_META } from "@/src/lib/roles";

const isDev = process.env.NODE_ENV === "development";

// ── Inline icons ──────────────────────────────────────────────
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BellIcon   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const MenuIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const ChevronRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const PlusIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// ── Breadcrumb label map ──────────────────────────────────────
const LABELS: Record<string, string> = {
  dashboard:    "ড্যাশবোর্ড",
  "super-admin":"সুপার অ্যাডমিন",
  admin:        "অ্যাডমিন",
  moderator:    "মডারেটর",
  teacher:      "শিক্ষক",
  parent:       "অভিভাবক",
  student:      "শিক্ষার্থী",
  students:     "শিক্ষার্থী তালিকা",
  teachers:     "শিক্ষক",
  attendance:   "উপস্থিতি",
  fees:         "ফি সংগ্রহ",
  notices:      "নোটিশ",
  results:      "ফলাফল",
  analytics:    "বিশ্লেষণ",
  institution:  "প্রতিষ্ঠান",
  settings:     "সেটিংস",
  upgrade:      "আপগ্রেড",
  "central-hub":"সেন্ট্রাল হাব",
};

// ── Role-specific primary CTA ─────────────────────────────────
const ROLE_CTA: Partial<Record<AppRole, { label: string; href: string }>> = {
  "super-admin": {
    label: "+ নতুন প্রতিষ্ঠান",
    href: "/dashboard/central-hub?action=new",
  },
  admin: { label: "+ শিক্ষার্থী যোগ", href: "/dashboard/students?action=new" },
  moderator: {
    label: "+ শিক্ষার্থী যোগ",
    href: "/dashboard/students?action=new",
  },
  teacher: { label: "উপস্থিতি নিন", href: "/dashboard/attendance" },
};

// ── Props ─────────────────────────────────────────────────────
interface TopbarProps {
  role: AppRole;
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  isDevOverride?: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({
  role,
  userName = "ব্যবহারকারী",
  userInitials = "?",
  notificationCount = 0,
  isDevOverride = false,
  onToggleSidebar,
}: TopbarProps) {
  const pathname = usePathname();
  const meta = ROLE_META[role];
  const cta = ROLE_CTA[role];

  // Build breadcrumb from pathname
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({ seg, label: LABELS[seg] ?? seg }));

  return (
    <header className="h-[60px] shrink-0 flex items-center gap-3 px-4 md:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-100 shrink-0"
      >
        <MenuIcon />
      </button>

      <div className="w-px h-5 bg-slate-200 shrink-0" />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0"
      >
        {crumbs.map((c, i) => (
          <span key={c.seg} className="flex items-center gap-1.5">
            {i < crumbs.length - 1 ? (
              <>
                <span className="text-slate-400">{c.label}</span>
                <span className="text-slate-300">
                  <ChevronRight />
                </span>
              </>
            ) : (
              <span className="font-semibold text-slate-800 truncate">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Mobile title */}
      <span className="sm:hidden font-semibold text-slate-800 text-[14px] truncate flex-1">
        {crumbs.at(-1)?.label ?? "ড্যাশবোর্ড"}
      </span>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-[34px] px-3 bg-slate-100 rounded-lg border border-transparent w-48 focus-within:w-56 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all duration-200">
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

      {/* Role-specific CTA */}
      {cta && (
        <a
          href={cta.href}
          className="hidden sm:flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 text-white text-[12px] font-semibold shadow-[0_2px_10px_rgba(10,158,245,0.30)] hover:shadow-[0_4px_16px_rgba(10,158,245,0.40)] hover:-translate-y-px transition-all duration-150 whitespace-nowrap"
        >
          <PlusIcon />
          {cta.label}
        </a>
      )}

      {/* Dev mode role badge — only visible in development */}
      {isDev && isDevOverride && (
        <span
          className={[
            "hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-full border border-current whitespace-nowrap",
            meta.color,
          ].join(" ")}
        >
          DEV: {meta.label}
        </span>
      )}

      {/* Bell */}
      <button
        aria-label={`${notificationCount} notifications`}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-100 shrink-0"
      >
        <BellIcon />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-blue-500 border-[1.5px] border-white shadow-[0_0_6px_rgba(10,158,245,0.7)]" />
        )}
      </button>

      {/* Avatar */}
      <div
        title={userName}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-[11px] font-bold text-slate-800 cursor-pointer shadow-sm shrink-0 select-none"
      >
        {userInitials}
      </div>
    </header>
  );
}
