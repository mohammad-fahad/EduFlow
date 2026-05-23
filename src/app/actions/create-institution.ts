// FILE: src/app/actions/create-institution.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isSuperAdmin } from "@/src/lib/admin-utils";

export type CreateInstitutionResult =
  | { success: true; institutionId: string }
  | { success: false; error: string };

export async function createInstitutionWithAdmin(
  formData: FormData,
): Promise<CreateInstitutionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only super-admin can call this
  if (!user || !isSuperAdmin(user.email)) {
    return {
      success: false,
      error:
        "অনুমতি নেই। শুধুমাত্র সুপার অ্যাডমিন নতুন প্রতিষ্ঠান তৈরি করতে পারবেন।",
    };
  }

  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as string) || "SCHOOL";
  const adminName = (formData.get("adminName") as string)?.trim();
  const adminEmail = (formData.get("adminEmail") as string)
    ?.trim()
    .toLowerCase();
  const trialDays = parseInt(formData.get("trialDays") as string) || 14;

  if (!name || !adminName || !adminEmail) {
    return {
      success: false,
      error: "প্রতিষ্ঠানের নাম, প্রধান শিক্ষকের নাম এবং ইমেইল আবশ্যক।",
    };
  }

  // Check if admin email already exists
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existing) {
    return {
      success: false,
      error: `${adminEmail} ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।`,
    };
  }

  // 1. Create institution
  const institution = await prisma.institution.create({
    data: {
      name,
      ownerName: adminName,
      ownerEmail: adminEmail,
      ownerId: user.id,
      type,
      status: "TRIAL",
      trialDays,
      expiresAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Invite admin user via Supabase (sends email invite)
  // Using admin client (service role) to create user without password
  const { data: inviteData, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(adminEmail, {
      data: {
        name: adminName,
        role: "ADMIN",
        institutionId: institution.id,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/admin`,
    });

  if (inviteError || !inviteData.user) {
    // Rollback institution if invite fails
    await prisma.institution.delete({ where: { id: institution.id } });
    return {
      success: false,
      error: `ইমেইল আমন্ত্রণ পাঠাতে ব্যর্থ: ${inviteError?.message}`,
    };
  }

  // 3. Create User record in DB linked to institution
  await prisma.user.create({
    data: {
      id: inviteData.user.id,
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      institutionId: institution.id,
    },
  });

  revalidatePath("/dashboard/central-hub");
  revalidatePath("/dashboard/institutions");

  return { success: true, institutionId: institution.id };
}
