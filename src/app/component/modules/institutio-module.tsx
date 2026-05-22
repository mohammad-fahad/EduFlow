"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const InstitutionModule: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const portalUrl = "https://eduflow.bd/public/darul-ulum-madrasa";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Trust Status Overview Banner */}
      <Card className="!p-6 border-amber-400/40 bg-gradient-to-br from-amber-500/5 to-transparent shadow-gold-glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <span className="text-3xl p-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">🏛️</span>
            <div>
              <h2 className="text-base font-black text-slate-800">দারুল উলুম মাদ্রাসা (Darul Ulum Madrasa)</h2>
              <p className="text-xs text-slate-500 mt-0.5">EIIN / রেজিঃ নম্বর: ১৩৪৫৬২ • স্তর: ইবতেদায়ী ও দাখিল</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified Board Merchant
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Modification Node */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            প্রাতিষ্ঠানিক তথ্য সংশোধন (Institution Info)
          </h3>
          <Input label="প্রতিষ্ঠানের নাম (Bangla Name)" defaultValue="দারুল উলুম মাদ্রাসা" />
          <Input label="Contact Mobile (অভিভাবক যোগাযোগের নম্বর)" defaultValue="01712345678" />
          <Button variant="primary" fullWidth>পরিবর্তন সংরক্ষণ করুন (Save Updates)</Button>
        </Card>

        {/* Public Parent Trust Link Gateway Channel */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              পাবলিক নোটিশ ও ফি পোর্টাল (Parent Portal Link)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
              কম্পিউটার বা ইন্টারনেট না জানা সাধারণ অভিভাবকরাও নিচের লিংকে প্রবেশ করে কোনো পাসওয়ার্ড ছাড়াই শুধুমাত্র শিক্ষার্থীর রোল নম্বর দিয়ে ফি পরিশোধের রসিদ দেখতে পারবেন।
            </p>
            <div className="mt-4 p-3 bg-[var(--off-white)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono-edu text-slate-600 truncate">{portalUrl}</span>
              <button 
                onClick={handleCopyLink}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
              >
                {copied ? "✓ কপি হয়েছে" : "লিংক কপি"}
              </button>
            </div>
          </div>
          
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-700 font-medium">
            💡 <strong>প্রো-টিপ:</strong> এই পোর্টাল লিংকটি প্রতিষ্ঠানের ফেসবুক গ্রুপ অথবা নোটিশ বোর্ডে ঝুলিয়ে রাখুন যাতে অভিভাবকরা ঘরে বসেই সরাসরি পেমেন্ট করতে পারেন।
          </div>
        </Card>
      </div>
    </div>
  );
};