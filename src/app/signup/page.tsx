"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Props {
  searchParams: Promise<{
    role?: string;
    institutionId?: string;
    token?: string;
  }>;
}

export default function SignupPage({ searchParams }: Props) {
  const router = useRouter();

  // Next.js 15+ searchParams রেজোলিউশন
  const resolvedParams = use(searchParams);
  const targetRole = resolvedParams.role || ""; // e.g., 'teacher' or 'student'
  const institutionId = resolvedParams.institutionId || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // লিঙ্ক ভ্যালিডেশন চেক
  const isValidLink = targetRole && institutionId;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Supabase Auth-এ ইউজার ক্রিয়েট করার সময় metadata তে রোল এবং ইনষ্টিটিউশন আইডি পাস করা
    // এটি পরবর্তীতে Supabase Trigger বা API দিয়ে প্রিজমা টেবিলে সিঙ্ক হবে
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: targetRole.toUpperCase(), // DB-র জন্য UPPERCASE কনভার্সন
          institutionId: institutionId,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    alert("Registration successful! Please login now.");
    router.push("/login");
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-rose-500 text-3xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800">
            Invalid Invitation Link
          </h1>
          <p className="text-sm text-slate-500">
            Please ask your school administrator or principal for a valid
            registration link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
            Joining as {targetRole}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-slate-500">
            Complete your profile setup for EduFlow
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
              placeholder="name@school.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50/50 outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold p-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Registering Profile..." : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
