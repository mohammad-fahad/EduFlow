// FILE: src/app/central-hub/components/CreateInstitutionForm.tsx
"use client";

import { createInstitutionWithAdmin } from "@/src/app/actions/create-institution";
import { useState, useTransition } from "react";


interface Props {
  onSuccess?: (institutionId: string) => void;
}

export default function CreateInstitutionForm({ onSuccess }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createInstitutionWithAdmin(formData);
      if (result.success) {
        setDone(true);
        onSuccess?.(result.institutionId);
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-[16px] text-slate-800 mb-1">
          প্রতিষ্ঠান তৈরি হয়েছে!
        </h3>
        <p className="text-[13px] text-slate-500">
          প্রধান শিক্ষকের ইমেইলে আমন্ত্রণ পাঠানো হয়েছে। তিনি ইমেইল কনফার্ম করার
          পর লগইন করতে পারবেন।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Institution name */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
          প্রতিষ্ঠানের নাম <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="যেমন: দারুল উলুম মাদ্রাসা"
          className="w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
          ধরন <span className="text-red-400">*</span>
        </label>
        <select
          name="type"
          className="w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all appearance-none cursor-pointer"
        >
          <option value="SCHOOL">বিদ্যালয় (School)</option>
          <option value="MADRASA">মাদ্রাসা (Madrasa)</option>
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          প্রধান শিক্ষক / অ্যাডমিন
        </p>
      </div>

      {/* Admin name */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
          প্রধান শিক্ষকের নাম <span className="text-red-400">*</span>
        </label>
        <input
          name="adminName"
          required
          placeholder="যেমন: মাওলানা আরিফ রহমান"
          className="w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Admin email */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
          ইমেইল ঠিকানা <span className="text-red-400">*</span>
        </label>
        <input
          name="adminEmail"
          type="email"
          required
          placeholder="principal@school.com"
          className="w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all placeholder:text-slate-400"
        />
        <p className="text-[11px] text-slate-400">
          এই ইমেইলে লগইন আমন্ত্রণ পাঠানো হবে।
        </p>
      </div>

      {/* Trial days */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
          ফ্রি ট্রায়াল (দিন)
        </label>
        <input
          name="trialDays"
          type="number"
          defaultValue={14}
          min={1}
          max={90}
          className="w-full h-10 px-3 text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(10,158,245,0.15)] transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
          {error}
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
          "✦ প্রতিষ্ঠান তৈরি করুন"
        )}
      </button>
    </form>
  );
}
