import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rollId, className, guardianPhone, monthlyFee } = body;

    // Server-side validation gatekeeping
    if (!name || !rollId || !className || !guardianPhone || !monthlyFee) {
      return NextResponse.json({ error: "সকল তথ্য প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    // Temporary fetch for initial launch setup:
    // In production, extract this dynamically via your Supabase Session user context headers
    let institution = await prisma.institution.findFirst();
    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: "দারুল উলুম মাদ্রাসা",
          ownerId: "temp-owner-id-launch",
        }
      });
    }

    // Write record into student database architecture matrix
    const newStudent = await prisma.student.create({
      data: {
        institutionId: institution.id,
        name,
        rollId: rollId.trim(),
        className: className.trim(),
        guardianPhone: guardianPhone.trim(),
        monthlyFee: parseFloat(monthlyFee),
      },
    });

    return NextResponse.json({ success: true, studentId: newStudent.id });
  } catch (error: any) {
    console.error("Student Direct Registration Route Error:", error);

    // Trap for Prisma's unique compound index constraint (@@unique([institutionId, className, rollId]))
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "এই শ্রেণীতে এই রোল নম্বরটি ইতিমধ্যে ব্যবহার করা হয়েছে।" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "সার্ভার অপারেশনাল ত্রুটি।" }, { status: 500 });
  }
}