// FILE: src/app/unauthorized/page.tsx
// This page was MISSING from the repo — causing 404 on every role redirect
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F03E3E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 mb-2">
          অ্যাক্সেস নেই
        </h1>
        <p className="text-[13px] text-slate-500 mb-6">
          আপনার এই পেজটি দেখার অনুমতি নেই।
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white text-[13px] font-semibold hover:bg-blue-600 transition-colors"
          >
            ড্যাশবোর্ডে ফিরুন
          </Link>
          <Link
            href="/login"
            className="h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 text-[13px] hover:bg-slate-50 transition-colors"
          >
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
