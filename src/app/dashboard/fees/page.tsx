// src/app/dashboard/fees/page.tsx
"use client";

import React, { useState } from "react";
import { FeePaymentModule } from "../../component/modules/fee-payment-module";
import { Card } from "../../component/ui/Card";


export default function FeesCollectionPage() {
  const currentMonthName = new Date().toLocaleDateString("bn-BD", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 page-enter font-bangla">
      {/* Structural Context Bar Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800">
            ফি আদায় ও পেমেন্ট কাউন্টার (Fee Collection Desk)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            চলতি মাস: <span className="text-blue-600 font-bold">{currentMonthName}</span>
          </p>
        </div>

        {/* Counter KPI Indicator Badge Block */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 font-mono-edu">
            Counter Active: 100% Secure
          </span>
        </div>
      </div>

      {/* Main Split Operations Grid Frame */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Real-Time Cashier Desk Processing Desk */}
        <div className="xl:col-span-5 glass p-5 rounded-2xl border border-slate-200 shadow-sm">
          <FeePaymentModule />
        </div>

        {/* Right Side: Informative Live Analytics Sheet Summary */}
        <div className="xl:col-span-7 space-y-4">
          <Card className="!p-5 border-slate-200">
            <h3 className="text-sm font-black text-slate-800 mb-3 border-b border-slate-100 pb-2 uppercase tracking-wide">
              আজকের কালেকশন সামারি (Collection Overview)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">💵 ক্যাশ আদায় (Cash)</p>
                <p className="text-xl font-black text-slate-800 mt-1">৳১২,৫০০</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                <p className="text-[10px] font-bold text-pink-600 uppercase">📱 বিকাশ মার্চেন্ট (bKash)</p>
                <p className="text-xl font-black text-[#E2136E] mt-1">৳৭২,০০০</p>
              </div>
            </div>
          </Card>

          <Card className="!p-5 border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">রিসেন্ট পেমেন্ট লগ (Recent Transactions)</h4>
              <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 text-slate-600 rounded">Live Feed</span>
            </div>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {[
                { id: "tx-1", name: "তারিকুল ইসলাম", type: "বিকাশ API", amount: 1500, status: "SUCCESS" },
                { id: "tx-2", name: "আফরিন সুলতানা", type: "নগদ ক্যাশ", amount: 1500, status: "SUCCESS" },
                { id: "tx-3", name: "মোহাম্মদ আলী", type: "বিকাশ API", amount: 1200, status: "SUCCESS" },
              ].map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{tx.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">মাধ্যমে: {tx.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 font-mono-edu">৳{tx.amount}</p>
                    <span className="text-[9px] font-bold text-emerald-600">✓ PAID</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}