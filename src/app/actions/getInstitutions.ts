"use server";
import { prisma } from "@/lib/prisma";

export async function getInstitutions() {
  const data = await prisma.institution.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log("SERVER ACTION: Found records:", data.length); // Check Terminal
  return data;
}