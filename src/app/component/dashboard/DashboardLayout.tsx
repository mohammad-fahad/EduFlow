// FILE: src/components/dashboard/DashboardLayout.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { type AppRole } from "./nav-config";

// ── Session user shape ────────────────────────────────────────
// Extend this interface as auth data becomes richer.
interface SessionUser {
  id:              string;
  email:           string;
  role:            AppRole;
  name:            string;
  initials:        string;
  institutionName: string;
  notificationCount: number;
}

// ── Helper: derive initials from a name ──────────────────────
function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ── Loading screen ────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase font-mono-edu">
          অনুমোদন যাচাই করা হচ্ছে...
        </p>
      </div>
    </div>
  );
}

// ── Mobile overlay ────────────────────────────────────────────
function MobileOverlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      aria-hidden
      className="fixed inset-0 bg-black/30 z-30 lg:hidden"
    />
  );
}

// ── DashboardLayout ───────────────────────────────────────────
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  // ── UI state ──────────────────────────────────────────────
  const [mobileSidebarOpen,    setMobileSidebarOpen]    = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  // ── Auth state ────────────────────────────────────────────
  const [user,    setUser]    = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Session check ─────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/login");
        return;
      }

      if (!isMounted) return;

      // ── Fetch database user record for role + institution ──
      // Replace this block with a server action / API route once
      // the full auth flow is wired. For now, falls back to ADMIN.
      const { data: dbUser } = await supabase
        .from("User")
        .select("role, name, institution:Institution(name)")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) return;

      const role: AppRole = (dbUser?.role as AppRole) ?? "ADMIN";
      const name  = dbUser?.name ?? session.user.email ?? "ব্যবহারকারী";

      // institution is returned as an object (Prisma relation) or null
      const institutionName =
        (dbUser?.institution as { name?: string } | null)?.name ??
        "EduFlow Platform";

      setUser({
        id:               session.user.id,
        email:            session.user.email ?? "",
        role,
        name,
        initials:         toInitials(name),
        institutionName,
        notificationCount: 0, // wire to a real query later
      });

      setLoading(false);
    };

    bootstrap();

    // ── Realtime auth state listener ──────────────────────
    // Handles token refresh and sign-out from another tab.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          router.replace("/login");
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // ── Sign-out handler ──────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  // ── Sidebar toggle: desktop collapses, mobile opens drawer ─
  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setDesktopSidebarCollapsed((v) => !v);
    } else {
      setMobileSidebarOpen((v) => !v);
    }
  }, []);

  // ── Loading gate ──────────────────────────────────────────
  if (loading || !user) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-[var(--off-white)] overflow-hidden">

      {/* ── Mobile overlay (closes drawer on outside tap) ── */}
      {mobileSidebarOpen && (
        <MobileOverlay onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      {/*
        Desktop: always visible, controlled via desktopSidebarCollapsed.
        Mobile:  fixed drawer, toggled via mobileSidebarOpen.
        The translate trick avoids layout shift on mobile.
      */}
      <div
        className={[
          // Mobile: fixed overlay drawer
          "fixed inset-y-0 left-0 z-40",
          "transition-transform duration-300 ease-out",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, part of flex flow
          "lg:static lg:z-auto lg:translate-x-0",
        ].join(" ")}
      >
        <Sidebar
          role={user.role}
          collapsed={desktopSidebarCollapsed}
          userName={user.name}
          userInitials={user.initials}
          institutionName={user.institutionName}
          onSignOut={handleSignOut}
        />
      </div>

      {/* ── Main area: Topbar + content ──────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <Topbar
          role={user.role}
          userName={user.name}
          userInitials={user.initials}
          notificationCount={user.notificationCount}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* ── Scrollable page content ─────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 py-5 md:px-6 md:py-7">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
