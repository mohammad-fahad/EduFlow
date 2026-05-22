"use client";

import React, { useState } from "react";
import { Button } from "../../component/ui/button";
import { createInstitution } from "../../actions/institutions";
import { Card } from "../../component/ui/Card";
import { cn } from "@/lib/utils";

export default function CentralHubDashboard({ initialData: institutions }: { initialData: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalMetrics] = useState({
    totalMRR: 185000,
    activeInstitutions: 24,
    pendingInvoices: 3,
    activeTrials: 5
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-bangla text-slate-800">
       <header className="h-[65px] bg-slate-900 text-white flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-display font-black shadow-lg shadow-blue-600/20">
            E
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide uppercase">EduFlow Central</h1>
            <p className="text-[10px] text-slate-400">গ্লোবাল বিজনেস প্যানেল (Global Operations)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-400 font-bold">
            👑 সুপার-এডমিন মোড (Super-Admin)
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold font-display text-white">
            M
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Core Financial & Analytical Health Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4 border-slate-200/60 shadow-sm bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মাসিক পৌনঃপুনিক আয় (MRR)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">৳{globalMetrics.totalMRR.toLocaleString("bn-BD")}</p>
            <span className="text-[10px] text-emerald-600 font-bold">↑ ১২% এই মাসে</span>
          </Card>
          
          <Card className="!p-4 border-slate-200/60 shadow-sm bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট নিবন্ধিত প্রতিষ্ঠান</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{globalMetrics.activeInstitutions} টি</p>
            <span className="text-[10px] text-slate-400">স্কুল ও মাদ্রাসা সম্মিলিত</span>
          </Card>

          <Card className="!p-4 border-slate-200/60 shadow-sm bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">বকেয়া ইনভয়েস এলার্ট</p>
            <p className={cn("text-2xl font-black mt-1", globalMetrics.pendingInvoices > 0 ? "text-rose-600" : "text-slate-900")}>
              {globalMetrics.pendingInvoices} টি
            </p>
            <span className="text-[10px] text-rose-500 font-bold animate-pulse">⚠️ তাগিদ দেওয়া প্রয়োজন</span>
          </Card>

          <Card className="!p-4 border-slate-200/60 shadow-sm bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">চলতি ফ্রি-ট্রায়াল</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{globalMetrics.activeTrials} টি</p>
            <span className="text-[10px] text-slate-400">স্বয়ংক্রিয় পজ ট্র্যাকিং সচল</span>
          </Card>
        </div>

        {/* Operational Split Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Institution Control Roster */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div>
                <h3 className="font-bold text-sm text-slate-900">ক্লায়েন্ট ডাটাবেজ মাস্টার (Client Directory)</h3>
                <p className="text-xs text-slate-400 mt-0.5">সিস্টেমের সকল স্কুল এবং মাদ্রাসার লাইসেন্স কন্ট্রোল প্যানেল।</p>
              </div>
              <Button variant="primary" className="!text-xs !py-2" onClick={() => setShowAddModal(true)}>
                ➕ নতুন ক্লায়েন্ট অনবোর্ড করুন
              </Button>
            </div>
          </div>
        {/* Main Institution Control Roster */}
<div className="lg:col-span-8 space-y-3">


  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
    {institutions.map((inst, index) => (
      <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-slate-100 rounded-xl border border-slate-200">{inst.type === "MADRASA" ? "🕌" : "🏫"}</span>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{inst.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">মালিক: {inst.ownerName} • প্যাকেজ: <span className="font-bold text-slate-600">{inst.packageTier}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">⚙️</button>
          <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">🗑️</button>
          
          <div className="text-right border-l pl-4 ml-2">
            <p className="text-xs font-bold text-slate-900">৳{inst.subscriptionPrice}</p>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", 
              inst.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
              {inst.status === "PAID" ? "✅ Active" : "❌ Suspended"}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Right Side Sticky Assistant Feed Panel */}
<div className="lg:col-span-4 space-y-4">
  <Card className="!p-4 border-slate-200 bg-white">
    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">💡 এডমিন গাইড</h4>
    <p className="text-xs text-slate-600 leading-relaxed">
      নতুন প্রতিষ্ঠান অনবোর্ড করার পর, সিস্টেম স্বয়ংক্রিয়ভাবে তাদের অফিশিয়াল ইমেইলে <strong>EduFlow Welcome Kit</strong> পাঠাবে। এরপর তারা ড্যাশবোর্ডে পাসওয়ার্ড সেট করে কার্যক্রম শুরু করতে পারবেন। কোনো ইস্যু থাকলে সরাসরি স্ট্যাটাস পরিবর্তন করুন।
    </p>
  </Card>

  <Card className="!p-4 border-slate-200 bg-white">
    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">📊 সিস্টেম হেলথ</h4>
    <div className="space-y-2 text-xs">
      <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500">Database</span> <span className="font-bold text-emerald-600">Connected</span></div>
      <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500">Gateway</span> <span className="font-bold text-emerald-600">Operational</span></div>
    </div>
  </Card>
</div>
        </div>
      </main>
      
     {showAddModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <form action={createInstitution} onSubmit={() => setShowAddModal(false)} 
          className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100">
      <h2 className="text-xl font-black text-slate-900 mb-6">নতুন প্রতিষ্ঠান যোগ করুন</h2>
      
      <div className="space-y-4">
        <input name="name" placeholder="প্রতিষ্ঠানের নাম" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <input name="ownerName" placeholder="মালিকের নাম" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <input name="ownerEmail" type="email" placeholder="ইমেইল ঠিকানা" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
        
        <div className="grid grid-cols-2 gap-3">
          <select name="type" className="p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none">
            <option value="SCHOOL">🏫 স্কুল</option>
            <option value="MADRASA">🕌 মাদ্রাসা</option>
          </select>
          <select name="packageType" className="p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none">
            <option value="BASIC">Basic</option>
            <option value="PREMIUM">Premium</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>বাতিল</Button>
        <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">সংরক্ষণ করুন</Button>
      </div>
    </form>
  </div>
)}
    </div>
  );
}