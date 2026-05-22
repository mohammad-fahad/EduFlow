// src/components/modules/super-admin-module.tsx
"use client";

import React, { useState } from "react";

// 🚀 FIXED: Adhering strictly to your requested folder import routes
import { Button } from "../ui/button";
import { Card } from "../ui/Card"; // Matches your strict capital C file path naming conventions
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface BusinessProfile {
  id: string;
  name: string;
  type: "SCHOOL" | "MADRASA";
  packageTier: "BASIC" | "STANDARD" | "PREMIUM";
  status: "TRIAL" | "PAID" | "UNPAID" | "SUSPENDED";
  daysLeft: number;
  studentCount: number;
}

export const SuperAdminModule: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [institutions, setInstitutions] = useState<BusinessProfile[]>([
    { id: "inst-1", name: "দারুল উলুম মাদ্রাসা", type: "MADRASA", packageTier: "STANDARD", status: "TRIAL", daysLeft: 9, studentCount: 342 },
    { id: "inst-2", name: "মিরপুর আইডিয়াল হাই স্কুল", type: "SCHOOL", packageTier: "PREMIUM", status: "PAID", daysLeft: 31, studentCount: 1150 },
    { id: "inst-3", name: "ফয়েজিয়া ক্যাডেট মাদ্রাসা", type: "MADRASA", packageTier: "BASIC", status: "SUSPENDED", daysLeft: 0, studentCount: 140 },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    type: "SCHOOL",
    packageTier: "BASIC",
    trialDays: "14",
    ownerEmail: ""
  });

  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: BusinessProfile = {
      id: `inst-${Date.now()}`,
      name: formData.name,
      type: formData.type as "SCHOOL" | "MADRASA",
      packageTier: formData.packageTier as "BASIC" | "STANDARD" | "PREMIUM",
      status: "TRIAL",
      daysLeft: parseInt(formData.trialDays) || 14,
      studentCount: 0
    };

    setInstitutions([newEntry, ...institutions]);
    setShowWizard(false);
    setFormData({ name: "", type: "SCHOOL", packageTier: "BASIC", trialDays: "14", ownerEmail: "" });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === id) {
        const nextStatus = currentStatus === "SUSPENDED" ? "PAID" : "SUSPENDED";
        return { ...inst, status: nextStatus as any };
      }
      return inst;
    }));
  };

  return (
    <div className="space-y-6 page-enter font-bangla">
      {/* Super Admin Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl border border-blue-200/40 shadow-blue-glow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট পার্টনার প্রতিষ্ঠান</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{institutions.length} টি</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-emerald-200/40 shadow-green-glow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">চলতি মাসের মোট আয়</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">৳৮,৫০০</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-amber-200/40 shadow-gold-glow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">অ্যাক্টিভ ট্রায়াল অ্যাকাউন্ট</p>
          <p className="text-2xl font-black text-amber-600 mt-1">১ টি প্রতিষ্ঠান</p>
        </div>
      </div>

      {/* Control Strip Strip Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-800">EduFlow বিজনেস হাব (Platform Manager)</h2>
          <p className="text-xs text-slate-400 mt-0.5">নতুন শিক্ষা প্রতিষ্ঠান যুক্ত করুন এবং লাইসেন্সিং ও পেমেন্ট স্ট্যাটাস নিয়ন্ত্রণ করুন।</p>
        </div>
        <Button variant="primary" className="!py-2.5" onClick={() => setShowWizard(!showWizard)}>
          {showWizard ? "✕ বন্ধ করুন" : "➕ নতুন প্রতিষ্ঠান যুক্ত করুন"}
        </Button>
      </div>

      {/* Subscription Creation Wizard Form Form Box */}
      {showWizard && (
        <Card className="border-blue-500/20 bg-blue-500/5 !p-6 page-enter">
          <form onSubmit={handleCreateInstitution} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input 
                label="প্রতিষ্ঠানের নাম (School / Madrasa Full Name)" 
                placeholder="উদাঃ মিরপুর ক্যাডেট মাদ্রাসা"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <Input 
              label="প্রধান শিক্ষকের ইমেইল (Principal Owner Email)" 
              placeholder="principal@email.com"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
              required
            />
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">প্রতিষ্ঠানের ধরণ (Type)</label>
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="SCHOOL">🏫 স্কুল (School)</option>
                <option value="MADRASA">🕌 মাদ্রাসা (Madrasa)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">প্যাকেজ প্ল্যান (Package Tier)</label>
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                value={formData.packageTier}
                onChange={(e) => setFormData({...formData, packageTier: e.target.value})}
              >
                <option value="BASIC">BASIC (৳১,০০০/মাস)</option>
                <option value="STANDARD">STANDARD (৳২,৫০০/মাস)</option>
                <option value="PREMIUM">PREMIUM (৳৫,০০০/মাস)</option>
              </select>
            </div>

            <Input 
              label="ফ্রি ট্রায়াল মেয়াদ (Trial Duration Days)" 
              type="number"
              value={formData.trialDays}
              onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
            />

            <div className="md:col-span-3 flex justify-end pt-2">
              <Button variant="success" className="px-8" type="submit">✓ অ্যাকাউন্ট তৈরি করুন</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Listing Viewport Layer Grid Framework */}
      <div className="space-y-2">
        {institutions.map((inst) => (
          <Card key={inst.id} className="!p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100">
                {inst.type === "MADRASA" ? "🕌" : "🏫"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">{inst.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{inst.packageTier}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ধরণ: {inst.type === "MADRASA" ? "মাদ্রাসা" : "স্কুল"} • সর্বমোট শিক্ষার্থী: {inst.studentCount} জন
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
              <div className="text-right">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block",
                  inst.status === "PAID" && "bg-emerald-500/10 text-emerald-600",
                  inst.status === "TRIAL" && "bg-blue-500/10 text-blue-600",
                  inst.status === "SUSPENDED" && "bg-rose-500/10 text-rose-600 animate-pulse"
                )}>
                  {inst.status === "PAID" ? "✅ একটিভ (Paid)" : inst.status === "TRIAL" ? `⏳ ট্রায়াল (${inst.daysLeft} দিন বাকি)` : "🚫 স্থগিত (Paused)"}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => toggleStatus(inst.id, inst.status)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  inst.status === "SUSPENDED" 
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm" 
                    : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                )}
              >
                {inst.status === "SUSPENDED" ? "🔓 অ্যাকাউন্ট চালু করুন" : "🔒 সাময়িক বন্ধ করুন"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};