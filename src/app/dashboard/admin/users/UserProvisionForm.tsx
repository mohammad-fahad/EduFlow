// FILE: src/app/dashboard/admin/users/UserProvisionForm.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { provisionUser } from "./actions";

type RoleOption = "TEACHER" | "MODERATOR" | "STUDENT";

export function UserProvisionForm() {
  const [role, setRole]         = useState<RoleOption>("TEACHER");
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await provisionUser(fd);
      if (result.ok) {
        setSuccess(true);
        formRef.current?.reset();
        setRole("TEACHER");
      } else {
        setError(result.error);
      }
    });
  }

  const inputCls =
    "w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all placeholder:text-slate-400";

  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="font-display text-[15px] font-semibold text-slate-800 mb-5">
        নতুন ব্যবহারকারী যোগ করুন
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelCls}>
            পুরো নাম <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="যেমন: মাওলানা আরিফ রহমান"
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>
            ইমেইল ঠিকানা <span className="text-red-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="example@school.com"
            className={inputCls}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            এই ইমেইলে লগইন আমন্ত্রণ পাঠানো হবে।
          </p>
        </div>

        {/* Role */}
        <div>
          <label className={labelCls}>
            ভূমিকা <span className="text-red-400">*</span>
          </label>
          <select
            name="role"
            required
            value={role}
            onChange={e => setRole(e.target.value as RoleOption)}
            className={inputCls + " cursor-pointer appearance-none"}
          >
            <option value="TEACHER">শিক্ষক (TEACHER)</option>
            <option value="MODERATOR">মডারেটর (MODERATOR)</option>
            <option value="STUDENT">শিক্ষার্থী (STUDENT)</option>
          </select>
        </div>

        {/* ── Dynamic Student fields ────────────────────────────── */}
        {role === "STUDENT" && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              শিক্ষার্থীর তথ্য
            </p>

            {/* Roll ID */}
            <div>
              <label className={labelCls}>
                রোল নম্বর <span className="text-red-400">*</span>
              </label>
              <input
                name="rollId"
                required
                placeholder="যেমন: G-05 বা ১২"
                className={inputCls}
              />
            </div>

            {/* Class name */}
            <div>
              <label className={labelCls}>
                শ্রেণি <span className="text-red-400">*</span>
              </label>
              <input
                name="className"
                required
                placeholder="যেমন: Class 5, Mizan, Nahw"
                className={inputCls}
              />
            </div>

            {/* Guardian phone (WhatsApp) */}
            <div>
              <label className={labelCls}>
                অভিভাবকের ফোন (WhatsApp) <span className="text-red-400">*</span>
              </label>
              <input
                name="guardianPhone"
                required
                type="tel"
                placeholder="01XXXXXXXXX"
                className={inputCls}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                WhatsApp নোটিফিকেশন ও ফি রিমাইন্ডারের জন্য ব্যবহৃত হবে।
              </p>
            </div>

            {/* Monthly fee */}
            <div>
              <label className={labelCls}>
                মাসিক বেতন (৳) <span className="text-red-400">*</span>
              </label>
              <input
                name="monthlyFee"
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="যেমন: 1500"
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-[12px] text-green-700 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            ব্যবহারকারী তৈরি হয়েছে এবং আমন্ত্রণ পাঠানো হয়েছে।
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white text-[13px] font-semibold shadow-[0_2px_10px_rgba(10,158,245,0.30)] hover:shadow-[0_4px_16px_rgba(10,158,245,0.40)] hover:-translate-y-px transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
        >
          {pending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              তৈরি হচ্ছে...
            </>
          ) : (
            "✦ ব্যবহারকারী তৈরি করুন"
          )}
        </button>
      </form>
    </div>
  );
}
