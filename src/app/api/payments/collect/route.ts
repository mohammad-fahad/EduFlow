import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, month, amount, method, reference } = body;

    // Guard rails for incoming dashboard collection objects
    if (!studentId || !month || !amount || !method) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় তথ্য দেওয়া হয়নি (Missing parameters)" }, 
        { status: 400 }
      );
    }

    // Upsert or create payment sheet row natively inside Prisma PostgreSQL backend
    const savedPayment = await prisma.payment.create({
      data: {
        studentId,
        month,
        amount: parseFloat(amount.toString()),
        // If it's BKASH, store the transaction ID; if it's CASH/NAGAD, map to reference logs
        bkashTrxId: method === "BKASH" ? reference : null,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      paymentId: savedPayment.id,
      message: "পেমেন্ট সফলভাবে ডাটাবেজে রেকর্ড করা হয়েছে।" 
    });

  } catch (error: any) {
    console.error("Payment Capture Route Error:", error);
    
    // Catch duplicate transaction keys safely
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "এই ট্রানজেকশন আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে (Duplicate TrxID)" }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "অভ্যন্তরীণ ডাটাবেজ ত্রুটি (Internal Server Failure)" }, 
      { status: 500 }
    );
  }
}