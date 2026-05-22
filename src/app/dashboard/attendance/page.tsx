// src/app/dashboard/attendance/page.tsx
"use client";

import React, { useState } from "react";
import { Card } from "../../component/ui/Card";
import { AttendanceModule } from "../../component/modules/attendance-module";


export default function AttendancePage() {
  const [currentClass, setCurrentClass] = useState("Class 5");
  const currentDate = new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 page-enter font-bangla">
      {/* Upper Control Bar Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800">
            দৈনিক ডিজিটাল হাজিরা খাতা (Attendance Sheets)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            আজকের তারিখ: <span className="text-blue-600 font-bold">{currentDate}</span>
          </p>
        </div>

        {/* Dynamic Class Selector Dropdown Component */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">জামাত / শ্রেণী:</span>
          <select
            value={currentClass}
            onChange={(e) => setCurrentClass(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl outline-none focus:border-blue-500 transition"
          >
            <option value="Class 5">Class 5 (পঞ্চম শ্রেণী)</option>
            <option value="Class 6">Class 6 (ষষ্ঠ শ্রেণী)</option>
            <option value="Class 7">Class 7 (সপ্তম শ্রেণী)</option>
          </select>
        </div>
      </div>

      {/* Main Fast-Processing Module Card Wrapper */}
      <Card className="!p-5 border-slate-200 max-w-4xl mx-auto">
        <AttendanceModule />
      </Card>
    </div>
  );
}