"use client";

import React, { useState, useEffect } from "react";

import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase/client";

interface StudentAttendanceState {
  id: string;
  rollId: string;
  name: string;
  className: string;
  isPresent: boolean | null;
}

export const AttendanceModule: React.FC = () => {
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Simulated live fetch matching your exact Student Prisma layout fields
  useEffect(() => {
    const loadClassRoster = async () => {
      // In production, replace with: const res = await fetch(`/api/students?class=${selectedClass}`);
      const mockPrismaData = [
        { id: "st-1", rollId: "১", name: "তারিকুল ইসলাম (Tariqul)", className: "Class 5" },
        { id: "st-2", rollId: "২", name: "আফরিন সুলতানা (Afrin)", className: "Class 5" },
        { id: "st-3", rollId: "৩", name: "মোহাম্মদ আলী (Md. Ali)", className: "Class 5" },
        { id: "st-4", rollId: "৪", name: "সুমাইয়া আক্তার (Sumaiya)", className: "Class 5" },
      ];
      setStudents(mockPrismaData.map(s => ({ ...s, isPresent: null })));
    };
    loadClassRoster();
  }, [selectedClass]);

  const toggleSingleStatus = (id: string, status: boolean) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isPresent: status } : s));
  };

  const setAllStatus = (status: boolean) => {
    setStudents(prev => prev.map(s => ({ ...s, isPresent: status })));
  };

  const handleAttendanceSubmit = async () => {
    const unassignedCount = students.filter(s => s.isPresent === null).length;
    if (unassignedCount > 0) {
      setMessage({ type: "error", text: "দয়া করে সবার হাজিরা নিশ্চিত করুন! (Mark all students)" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        records: students.map(s => ({ studentId: s.id, isPresent: s.isPresent }))
      };

      const response = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Network transaction rejected");

      setMessage({ type: "success", text: "✓ হাজিরা সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!" });
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার ত্রুটি। আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMarked = students.filter(s => s.isPresent !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wide">
            দ্রুত ডিজিটাল হাজিরা ট্র্যাকার
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">শ্রেণী: {selectedClass} • আজকের তারিখ</p>
        </div>
        <span className="text-xs font-mono-edu font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
          Marked: {totalMarked}/{students.length}
        </span>
      </div>

      {/* Speed optimization hotkeys for 90-second workflow */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => setAllStatus(true)}
          className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-2.5 text-xs font-bold hover:bg-emerald-100/70 active:scale-95 transition"
        >
          ✓ সবাই উপস্থিত (All Present)
        </button>
        <button 
          onClick={() => setAllStatus(false)}
          className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl py-2.5 text-xs font-bold hover:bg-rose-100/70 active:scale-95 transition"
        >
          ✗ সবাই অনুপস্থিত (All Absent)
        </button>
      </div>

      {/* Roster View Frame */}
      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 font-mono-edu shrink-0">
                {student.rollId}
              </div>
              <p className="font-bold text-xs text-slate-800 truncate">{student.name}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleSingleStatus(student.id, true)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  student.isPresent === true
                    ? "bg-[#00E67A] text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                P
              </button>
              <button
                onClick={() => toggleSingleStatus(student.id, false)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  student.isPresent === false
                    ? "bg-[#F03E3E] text-white shadow-md shadow-rose-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                A
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-bold ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        }`}>
          {message.text}
        </div>
      )}

      <Button variant="success" fullWidth disabled={isSubmitting} onClick={handleAttendanceSubmit}>
        {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "হাজিরা সাবমিট করুন (Submit Sheet)"}
      </Button>
    </div>
  );
};