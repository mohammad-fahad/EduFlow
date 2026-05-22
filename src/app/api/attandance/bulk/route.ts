// src/app/api/attendance/bulk/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, records } = body; // records = Array of { studentId: string, isPresent: boolean }

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "ত্রুটিপূর্ণ ডাটা ফরম্যাট (Invalid payload format)" },
        { status: 400 }
      );
    }

    // Direct multi-row batch transaction pipeline inside Prisma
    const transaction = await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            // Checks for an existing attendance record for this student on this specific day
            studentId_date: {
              studentId: record.studentId,
              date: new Date(date),
            },
          },
          update: {
            status: record.isPresent ? "PRESENT" : "ABSENT",
          },
          create: {
            studentId: record.studentId,
            date: new Date(date),
            status: record.isPresent ? "PRESENT" : "ABSENT",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: transaction.length,
      message: "হাজিরা শিট ডাটাবেজে সফলভাবে হালনাগাদ হয়েছে।"
    });

  } catch (error: any) {
    console.error("Bulk Attendance Write Route Error:", error);
    return NextResponse.json(
      { error: "অভ্যন্তরীণ সার্ভার অপারেশনাল ত্রুটি।" },
      { status: 500 }
    );
  }
}