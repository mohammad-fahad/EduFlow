// src/components/modules/fee-payment-module.tsx
"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";


export const FeePaymentModule: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "cash">("bkash");
  const [trxId, setTrxId] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [billingState, setBillingState] = useState<"invoice" | "success">("invoice");
  const [loading, setLoading] = useState(false);

  const activeInvoice = {
    studentId: "st-2",
    studentName: "আফরিন সুলতানা (Afrin)",
    rollId: "২",
    className: "Class 5",
    month: "May-2026",
    amount: 1500,
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        studentId: activeInvoice.studentId,
        month: activeInvoice.month,
        amount: activeInvoice.amount,
        method: paymentMethod.toUpperCase(), // "BKASH" or "CASH"
        reference: paymentMethod === "bkash" ? trxId : `CASH-${receivedBy || "ADMIN"}`,
      };

      // Connects directly to your Prisma DB via API
      const response = await fetch("/api/payments/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Transaction failed");

      setBillingState("success");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (billingState === "success") {
    return (
      <div className="text-center py-8 space-y-4 page-enter">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center text-xl font-bold">
          ✓
        </div>
        <div>
          <h4 className="text-base font-black text-slate-800">পেমেন্ট সফলভাবে সংরক্ষিত!</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ডিজিটাল ক্যাশ রসিদ তৈরি হয়েছে এবং ডাটাবেজে যুক্ত হয়েছে।
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="text-xs border border-[var(--color-border)]"
          onClick={() => { setBillingState("invoice"); setTrxId(""); setReceivedBy(""); }}
        >
          পরবর্তী পেমেন্ট নিন (Collect Next)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wide">
          ফি সংগ্রহ ও রসিদ কাউন্টার
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">প্রতিষ্ঠান ক্যাশিয়ার ও পেমেন্ট গেটওয়ে প্যানেল</p>
      </div>

      {/* Invoice Details Sheet */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">শিক্ষার্থী:</span>
          <span className="font-bold text-slate-800">{activeInvoice.studentName} (রোল: {activeInvoice.rollId})</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200/60">
          <span className="text-slate-800">মোট প্রদেয় ফি:</span>
          <span className="text-blue-600 font-display">৳{activeInvoice.amount}</span>
        </div>
      </div>

      {/* High-Contrast Method Switcher tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/40">
        <button
          onClick={() => setPaymentMethod("bkash")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            paymentMethod === "bkash" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📱 bKash পেমেন্ট
        </button>
        <button
          onClick={() => setPaymentMethod("cash")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            paymentMethod === "cash" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          💵 নগদ ক্যাশ সংগ্রহ
        </button>
      </div>

      {/* Conditional Content Layout based on context variables */}
      {paymentMethod === "bkash" ? (
        <div className="space-y-3">
          <a
            href={`/api/payments/bkash-trigger?amount=${activeInvoice.amount}`}
            className="w-full bg-[#E2136E] hover:bg-[#D10F64] text-white rounded-xl p-3 flex items-center justify-between shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-black text-[#E2136E] text-[10px]">bKash</div>
              <span className="text-xs font-extrabold">Pay with Live bKash API</span>
            </div>
            <span className="text-xs font-bold">৳{activeInvoice.amount} ➔</span>
          </a>
          
          <form onSubmit={handlePaymentSubmission} className="space-y-2">
            <Input 
              label="বিকাশ ট্রানজেকশন আইডি (bKash TrxID)" 
              placeholder="Ex: BK84920KL" 
              value={trxId} 
              onChange={(e) => setTrxId(e.target.value)}
              required
            />
            <Button variant="primary" fullWidth disabled={loading}>
              {loading ? "ভেরিফাই করা হচ্ছে..." : "ম্যানুয়াল bKash পেমেন্ট কনফার্ম করুন"}
            </Button>
          </form>
        </div>
      ) : (
        /* Cash Payment Confirmation form design */
        <form onSubmit={handlePaymentSubmission} className="space-y-3 page-enter">
          <Input 
            label="ক্যাশ গ্রহণকারীর নাম / সিগনেচার (Received By)" 
            placeholder="Ex: মাওঃ আব্দুর রহমান" 
            value={receivedBy} 
            onChange={(e) => setReceivedBy(e.target.value)}
            required
          />
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-700 font-medium">
            ⚠️ <strong>ক্যাশ নিশ্চিতকরণ নোটিশ:</strong> বোতামটি চাপার সাথে সাথে শিক্ষার্থীকে পেইড হিসেবে তালিকাভুক্ত করা হবে এবং ক্যাশ খাতার লেজারে ৳{activeInvoice.amount} জমা হয়ে যাবে।
          </div>
          <Button variant="success" fullWidth disabled={loading}>
            {loading ? "সংরক্ষণ হচ্ছে..." : "নগদ টাকা পেয়েছি, রশিদ প্রিন্ট করুন"}
          </Button>
        </form>
      )}
    </div>
  );
};