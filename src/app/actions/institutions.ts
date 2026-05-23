"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInstitution(formData: FormData) {
  const name = formData.get("name") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const type = formData.get("type") as string;

  await prisma.institution.create({
    data: {
      name,
      ownerEmail,
      ownerId: "system",
      type: type || "SCHOOL",
      status: "TRIAL",
    },
  });

  revalidatePath("/dashboard/central-hub");
}