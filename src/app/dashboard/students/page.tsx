// src/app/dashboard/students/page.tsx
"use client";

import React, { useState } from "react";
import { Card } from "../../component/ui/Card";
import { Input } from "../../component/ui/input";
import { Button } from "../../component/ui/button";
import { StudentModule } from "../../component/modules/student-module";


interface StudentProfile {
  id: string;
  name: string;
  rollId: string;
  className: string;
  guardianPhone: string;
  monthlyFee: number;
  feeStatus: "Paid" | "Unpaid";
}

export default function StudentsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Enriched mockup array containing real-world launch data state signatures
  const [students, setStudents] = useState<StudentProfile[]>([
    { id: "s1", name: "তারিকুল ইসলাম (Tariqul Islam)", rollId: "১", className: "Class 5", guardianPhone: "01711223344", monthlyFee: 1500, feeStatus: "Paid" },
    { id: "s2", name: "আফরিন সুলতানা (Afrin Sultana)", rollId: "২", className: "Class 5", guardianPhone: "01911223344", monthlyFee: 1500, feeStatus: "Unpaid" },
    { id: "s3", name: "মোহাম্মদ আলী (Md. Ali)", rollId: "৩", className: "Class 5", guardianPhone: "01511223344", monthlyFee: 1200, feeStatus: "Paid" },
    { id: "s4", name: "সুমাইয়া আক্তার (Sumaiya Akter)", rollId: "৪", className: "Class 5", guardianPhone: "01811223344", monthlyFee: 1200, feeStatus: "Unpaid" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    rollId: "",
    className: "Class 5",
    guardianPhone: "",
    monthlyFee: "",
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Onboarding failed");

      // Instantly inject new student profile into UI as Unpaid state tracking record
      const newlyCreatedStudent: StudentProfile = {
        id: result.studentId || `temp-${Date.now()}`,
        name: formData.name,
        rollId: formData.rollId.trim(),
        className: formData.className.trim(),
        guardianPhone: formData.guardianPhone.trim(),
        monthlyFee: parseFloat(formData.monthlyFee),
        feeStatus: "Unpaid"
      };

      setStudents((prev) => [newlyCreatedStudent, ...prev]);
      setShowAddForm(false);
      setFormData({ name: "", rollId: "", className: "Class 5", guardianPhone: "", monthlyFee: "" });
    } catch (err: any) {
      alert(`❌ ত্রুটি ঘটেছে: ${err.message || "রোল নম্বরটি ইতিমধ্যে ব্যবহৃত।"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Upper Context Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[var(--color-text)]">
            শিক্ষার্থী ভর্তি ও তালিকা (Student Roster)
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            নতুন শিক্ষার্থী যুক্ত করুন এবং বর্তমান প্রোফাইলসমূহ ট্র্যাক করুন।
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${
            showAddForm 
              ? "bg-slate-200 text-slate-800" 
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          }`}
        >
          {showAddForm ? "✕ বন্ধ করুন (Close)" : "➕ নতুন ভর্তি (Add Student)"}
        </button>
      </div>

      {/* Slide-Down Addition Form Panel */}
      {showAddForm && (
        <Card className="border-blue-500/20 bg-blue-500/5 !p-6 page-enter">
          <h3 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-200/60 pb-2 uppercase tracking-wide">
            নতুন শিক্ষার্থী নিবন্ধন ফরম (New Student Onboarding)
          </h3>
          <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            <Input 
              label="শিক্ষার্থীর নাম (Student Full Name)" 
              placeholder="উদাঃ তারিকুল ইসলাম"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="রোল নম্বর (Roll Number/ID)" 
              placeholder="উদাঃ ৫"
              value={formData.rollId}
              onChange={(e) => setFormData({...formData, rollId: e.target.value})}
              required
            />
            <Input 
              label="শ্রেণী / জামাত (Class Group)" 
              placeholder="উদাঃ Class 5"
              value={formData.className}
              onChange={(e) => setFormData({...formData, className: e.target.value})}
              required
            />
            <Input 
              label="অভিভাবকের মোবাইল নম্বর (Guardian Phone)" 
              placeholder="উদাঃ 017XXXXXXXX"
              maxLength={11}
              value={formData.guardianPhone}
              onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
              required
            />
            <Input 
              label="মাসিক প্রদেয় ফি (Monthly Tuition Fee)" 
              placeholder="উদাঃ ১৫০০"
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})}
              required
            />
            <div className="flex items-end pb-4">
              <Button variant="success" fullWidth type="submit" disabled={isSubmitting}>
                {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "✓ ভর্তি নিশ্চিত করুন (Confirm Admission)"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Roster Interface Card */}
      <Card className="!p-5">
        <StudentModule students={students} />
      </Card>
    </div>
  );
}