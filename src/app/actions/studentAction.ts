"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

// ম্যানুয়ালি সিঙ্গেল স্টুডেন্টকে মেসেজ পাঠানোর অ্যাকশন
export async function sendManualReminder(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new Error("Student not found");

  const message = `🔔 *জরুরী নোটিশ* 🔔\n\nপ্রিয় অভিভাবক, আপনার সন্তান *${student.name}*-এর স্কুলের মাসিক ফি বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত ফি পরিশোধের ব্যবস্থা করুন।`;

  const success = await sendWhatsAppMessage(student.guardianPhone, message);
  return { success };
}

// স্টুডেন্টের স্কলারশিপ/স্পেশাল কনসিডারেশন স্ট্যাটাস পরিবর্তন করার অ্যাকশন
export async function updateStudentStatus(
  studentId: string,
  status: "REGULAR" | "SCHOLARSHIP" | "SPECIAL_DUE",
) {
  await prisma.student.update({
    where: { id: studentId },
    data: { considerationStatus: status },
  });

  revalidatePath("/dashboard/students");
  return { success: true };
}
