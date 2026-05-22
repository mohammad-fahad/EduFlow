// src/components/modules/student-module.tsx
"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Card } from "../ui/Card";
import { Button } from "../ui/button";


interface StudentProfile {
  id: string;
  name: string;
  rollId: string;
  className: string;
  guardianPhone: string;
  monthlyFee: number;
  feeStatus: "Paid" | "Unpaid"; // Restored billing status tracking property
}

interface StudentModuleProps {
  students: StudentProfile[];
}

export const StudentModule: React.FC<StudentModuleProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "Unpaid">("all");

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.rollId.toString() === searchTerm ||
      student.guardianPhone.includes(searchTerm);
      
    const matchesFilter = activeFilter === "all" || student.feeStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search & Fast Filtering Control Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-6">
          <Input 
            label="শিক্ষার্থী খুঁজুন (Search Student Name / Roll)" 
            placeholder="নাম, রোল অথবা মোবাইল নম্বর লিখুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-6 flex gap-2 pb-4">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
              activeFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "glass text-slate-700 border-[var(--color-border)] hover:bg-slate-50"
            }`}
          >
            সব শিক্ষার্থী (All)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("Unpaid")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
              activeFilter === "Unpaid"
                ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20"
                : "glass text-rose-600 border-[var(--color-border)] hover:bg-rose-50"
            }`}
          >
            বকেয়া তালিকা (Unpaid)
          </button>
        </div>
      </div>

      {/* Restored Responsive List Row Profiles Vector */}
      <div className="space-y-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={student.id} className="!p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-blue-glow-lg transition-all duration-200 page-enter">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--off-white)] border border-[var(--color-border)] flex items-center justify-center font-bold text-slate-700 font-mono-edu">
                  {student.rollId}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)]">{student.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {student.className} • অভিভাবক: {student.guardianPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.feeStatus === "Paid" 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse"
                }`}>
                  {student.feeStatus === "Paid" ? "পরিশোধিত" : "বকেয়া ফি"}
                </span>
                <Button variant="ghost" className="!py-1.5 !px-3 text-xs border border-[var(--color-border)]">
                  প্রোফাইল ➔
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center py-8 text-xs font-medium text-[var(--color-text-muted)] font-mono-edu">
            কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
          </p>
        )}
      </div>
    </div>
  );
};