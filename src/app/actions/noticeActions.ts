"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function createNotice(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) throw new Error("Unauthorized");

  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, institutionId: true },
  });

  if (!dbUser || !dbUser.institutionId) {
    throw new Error("User does not belong to an institution.");
  }

  if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "TEACHER") {
    throw new Error("You do not have permission to post notices.");
  }

  const newNotice = await prisma.notice.create({
    data: {
      title,
      content,
      authorId: dbUser.id,
      institutionId: dbUser.institutionId,
    },
  });

  try {
    // প্রিন্সিপাল যদি শিক্ষকদের লক্ষ্য করে নোটিশ লেখেন (যেমন টাইটেলে [TEACHER] বা [STAFF] থাকলে)
    if (
      title.toUpperCase().includes("[TEACHER]") ||
      title.toUpperCase().includes("[STAFF]")
    ) {
      // শুধু ওই স্কুলের শিক্ষকদের ডাটা নিয়ে আসা
      const teachers = await prisma.user.findMany({
        where: {
          institutionId: dbUser.institutionId,
          role: "TEACHER",
        },
        select: { email: true }, // যদি ইউজারের ফোন নম্বর কলাম না থাকে, আপাতত ইমেইল বা লগে রাখতে পারেন
      });

      // শিক্ষকদের মেসেজ পাঠানোর লজিক (আপনার ইউজার মডেলে ফোন ফিল্ড যোগ করলে সচল হবে)
      console.log(
        `Sending teacher-only notice to ${teachers.length} teachers.`,
      );
    } else {
      // সাধারণ নোটিশ হলে স্কুলের সব অভিভাবকের guardianPhone-এ হোয়াটসঅ্যাপ যাবে
      const students = await prisma.student.findMany({
        where: { institutionId: dbUser.institutionId },
        select: { guardianPhone: true, name: true },
      });

      // লুপ চালিয়ে সবার ফোনে মেসেজ পাঠানো
      for (const student of students) {
        if (student.guardianPhone) {
          const waMessage = `🔔 *নতুন নোটিশ বোর্ড আপডেট*\n\n*${title}*\n\n${content}`;
          await sendWhatsAppMessage(student.guardianPhone, waMessage);
        }
      }
    }
  } catch (waError) {
    // হোয়াটসঅ্যাপ এপিআই ফেইল করলেও যেন মূল নোটিশ তৈরি হওয়া আটকে না যায়
    console.error("WhatsApp notification failed:", waError);
  }

  // ৫. ড্যাশবোর্ড রিভ্যালিডেট করা যাতে সাথে সাথে নোটিশ আপডেট হয়
  revalidatePath("/dashboard/notices");

  return { success: true, noticeId: newNotice.id };
}
