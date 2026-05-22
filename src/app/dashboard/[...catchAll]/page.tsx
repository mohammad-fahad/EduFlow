// src/app/dashboard/[...catchAll]/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "../../component/ui/Card";
import { Button } from "../../component/ui/button";


export default function ModuleUnderConstructionPlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 page-enter">
      <Card className="max-w-md text-center p-6 space-y-4 border-blue-500/20 shadow-blue-glow">
        <span className="text-4xl block">🛠️</span>
        <div>
          <h3 className="text-base font-black text-slate-800">মডিউলটি তৈরি হচ্ছে (Under Construction)</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
            এই ফিচার প্যানেলের কাজ বর্তমানে দ্রুত গতিতে চলছে। পরবর্তী আপডেট সংস্করণে এটি ব্যবহার করার জন্য উন্মুক্ত করে দেওয়া হবে।
          </p>
        </div>
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => router.back()} // Instantly steps backward inside the native virtual client history safely
          className="text-xs font-bold border border-slate-200"
        >
          ⬅️ পূর্ববর্তী পেজে ফিরে যান (Go Back Safely)
        </Button>
      </Card>
    </div>
  );
}