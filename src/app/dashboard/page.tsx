// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import MetricCard from "../component/ui/metric-card";
import { AttendanceModule } from "../component/modules/attendance-module";
import { FeePaymentModule } from "../component/modules/fee-payment-module";


interface UserProfileState {
  name: string;
  role: "SUPER_ADMIN" | "PRINCIPAL" | "TEACHER";
  institutionName: string;
}

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<UserProfileState | null>(null);

  useEffect(() => {
    const fetchSessionUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setProfile({
        name: "মাওলানা আরিফ রহমান",
        role: "PRINCIPAL",
        institutionName: "দারুল উলুম মাদ্রাসা",
      });
    };

    fetchSessionUserData();
  }, []);

  if (!profile) {
    return (
      <div className="p-8 text-center text-xs font-bold font-mono-edu text-slate-400 tracking-widest animate-pulse">
        লোডিং ড্যাশবোর্ড...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Role Announcement Banner */}
      <div className="p-3.5 rounded-xl border border-blue-500/10 bg-blue-500/5 text-xs font-bold text-blue-700 flex items-center justify-between">
        <span>👋 আসসালামু আলাইকুম, {profile.name}!</span>
        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-mono-edu text-[10px] tracking-wide">
          {profile.role}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Inventory" banglaTitle="মোট শিক্ষার্থী" value="১২০ জন" icon="👥" glowVariant="blue" />
        <MetricCard title="Collection" banglaTitle="সংগৃহীত ফি" value="৳৮৪,৫০০" icon="৳" glowVariant="gold" />
        <MetricCard title="Active Status" banglaTitle="আজকের উপস্থিতি" value="৯৫.৪%" icon="⏱️" glowVariant="green" />
      </div>

      {/* Main Operations Split Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
          <AttendanceModule />
        </div>
        <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
          <FeePaymentModule />
        </div>
      </div>
    </div>
  );
}