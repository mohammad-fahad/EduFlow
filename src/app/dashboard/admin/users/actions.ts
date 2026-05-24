// FILE: src/app/dashboard/admin/users/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────
export type ProvisionResult =
  | { ok: true }
  | { ok: false; error: string };

// ── The authoritative institutionId for this admin tenant ─────
// Per spec: ff02d63b-b749-42e8-8330-751d1d10711c
// In a full multi-tenant flow this comes from the session; hardcoded per spec.
const INSTITUTION_ID = "ff02d63b-b749-42e8-8330-751d1d10711c";

// ── Allowed roles for this provisioning form ──────────────────
// SUPER_ADMIN and ADMIN are not creatable via this form —
// ADMIN is created by Super Admin only, SUPER_ADMIN never via UI.
const ALLOWED_ROLES: Role[] = [Role.TEACHER, Role.MODERATOR, Role.STUDENT];

// ── Server Action ─────────────────────────────────────────────
export async function provisionUser(
  formData: FormData,
): Promise<ProvisionResult> {
  // ── Auth guard: caller must be ADMIN or SUPER_ADMIN ──────────
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { ok: false, error: "অনুমোদিত নয়।" };

  const { data: callerRow } = await supabase
    .from("User")
    .select("role, institutionId")
    .eq("id", authUser.id)
    .single();

  if (
    !callerRow ||
    (callerRow.role !== "ADMIN" && callerRow.role !== "SUPER_ADMIN")
  ) {
    return { ok: false, error: "শুধুমাত্র অ্যাডমিন ব্যবহারকারী তৈরি করতে পারবেন।" };
  }

  // ── Parse + validate fields ───────────────────────────────────
  const name  = (formData.get("name")  as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const roleRaw = (formData.get("role") as string | null)?.trim().toUpperCase();

  if (!name || !email || !roleRaw) {
    return { ok: false, error: "নাম, ইমেইল এবং ভূমিকা আবশ্যক।" };
  }

  // Type-safe role check
  if (!ALLOWED_ROLES.includes(roleRaw as Role)) {
    return {
      ok: false,
      error: `অবৈধ ভূমিকা। অনুমোদিত: ${ALLOWED_ROLES.join(", ")}`,
    };
  }
  const role = roleRaw as Role;

  // ── Check for existing User row (email must be unique) ────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: `${email} ইমেইলটি ইতিমধ্যে নিবন্ধিত।` };
  }

  // ── Verify institution exists ─────────────────────────────────
  const institution = await prisma.institution.findUnique({
    where: { id: INSTITUTION_ID },
    select: { id: true },
  });
  if (!institution) {
    return { ok: false, error: "প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।" };
  }

  // ── 1. Invite user via Supabase Auth (sends email) ────────────
  // We use the admin client (service role) so the invite is sent
  // without the invited user needing to exist first.
  // NOTE: This requires SUPABASE_SERVICE_ROLE_KEY in env.
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: invited, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { name, role, institutionId: INSTITUTION_ID },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    });

  if (inviteError || !invited.user) {
    return {
      ok: false,
      error: `আমন্ত্রণ পাঠাতে ব্যর্থ: ${inviteError?.message ?? "অজানা ত্রুটি"}`,
    };
  }

  const newUserId = invited.user.id;

  // ── 2. prisma.$transaction: create User (+ Student if needed) ─
  try {
    if (role === Role.STUDENT) {
      // Student-specific fields
      const rollId       = (formData.get("rollId")        as string | null)?.trim();
      const className    = (formData.get("className")      as string | null)?.trim();
      const guardianPhone= (formData.get("guardianPhone")  as string | null)?.trim();
      const monthlyFeeRaw= (formData.get("monthlyFee")     as string | null)?.trim();
      const monthlyFee   = parseFloat(monthlyFeeRaw ?? "0");

      if (!rollId || !className || !guardianPhone) {
        // Invite already sent — delete the auth user to keep DB consistent
        await adminSupabase.auth.admin.deleteUser(newUserId);
        return {
          ok: false,
          error: "শিক্ষার্থীর জন্য রোল নম্বর, শ্রেণি এবং অভিভাবকের ফোন নম্বর আবশ্যক।",
        };
      }

      if (isNaN(monthlyFee) || monthlyFee < 0) {
        await adminSupabase.auth.admin.deleteUser(newUserId);
        return { ok: false, error: "মাসিক ফি সঠিকভাবে প্রবেশ করুন।" };
      }

      await prisma.$transaction([
        // Insert User row (id matches the Supabase Auth UID)
        prisma.user.create({
          data: {
            id:            newUserId,
            email,
            name,
            role:          Role.STUDENT,
            institutionId: INSTITUTION_ID,
          },
        }),
        // Insert Student row (separate model — has rollId, className etc.)
        prisma.student.create({
          data: {
            institutionId: INSTITUTION_ID,
            rollId,
            name,
            className,
            guardianPhone,
            monthlyFee,
            // considerationStatus defaults to REGULAR via Prisma schema
          },
        }),
      ]);
    } else {
      // TEACHER or MODERATOR — only User row needed
      await prisma.user.create({
        data: {
          id:            newUserId,
          email,
          name,
          role,
          institutionId: INSTITUTION_ID,
        },
      });
    }
  } catch (err: unknown) {
    // Rollback: delete the Supabase auth user so the invite can be retried
    await adminSupabase.auth.admin.deleteUser(newUserId);
    const message = err instanceof Error ? err.message : "DB ত্রুটি";
    return { ok: false, error: `ব্যবহারকারী সংরক্ষণ ব্যর্থ: ${message}` };
  }

  revalidatePath("/dashboard/admin/users");
  return { ok: true };
}
