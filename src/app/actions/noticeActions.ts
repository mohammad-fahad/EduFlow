// app/actions/noticeActions.ts
"use server";


import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


export async function createNotice(formData: FormData) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // 1. Verify the user's role and institution in the database
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, institutionId: true },
  });

  if (!dbUser || !dbUser.institutionId) {
    throw new Error("User does not belong to an institution.");
  }

  // 2. Permission Check: Only Admin (Principal) or Teacher
  if (dbUser.role !== "ADMIN" && dbUser.role !== "TEACHER") {
    throw new Error("You do not have permission to post notices.");
  }

  // 3. Create the Notice (implicitly tied to the user's institution)
  await prisma.notice.create({
    data: {
      title,
      content,
      authorId: authUser.id,
      institutionId: dbUser.institutionId, 
    },
  });

  // 4. Revalidate the dashboard so the new notice appears instantly
  revalidatePath("/dashboard");
  
  return { success: true };
}