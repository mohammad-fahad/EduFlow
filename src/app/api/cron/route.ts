import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(request: Request) {
  // Vercel Cron-এর সিকিউরিটি ভেরিফিকেশন
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // শুধুমাত্র REGULAR শিক্ষার্থীদের ডেটা আনা (Scholarship বা Special Due থাকলে বাদ যাবে)
    const regularStudents = await prisma.student.findMany({
      where: {
        considerationStatus: "REGULAR",
      },
    });

    let successCount = 0;

    for (const student of regularStudents) {
      const message = `⚠️ *বকেয়া স্কুল ফি নোটিশ* ⚠️\n\nপ্রিয় অভিভাবক,\nআপনার সন্তান *${student.name}* (শ্রেণী: ${student.className}, রোল: ${student.rollId})-এর চলতি মাসের স্কুলের মাসিক বেতন প্রদানের সময়সীমা পার হওয়ায় লেট ফি যুক্ত করা হয়েছে। অনুগ্রহ করে দ্রুত বকেয়া ফি পরিশোধ করুন।\n\n- ধন্যবাদ, স্কুল কর্তৃপক্ষ।`;

      const sent = await sendWhatsAppMessage(student.guardianPhone, message);
      if (sent) successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Late fee notifications processed. Sent: ${successCount}/${regularStudents.length}`,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
