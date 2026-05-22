
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json(
      { error: "ownerId required" },
      { status: 400 }
    );
  }

  const institutions = await prisma.institution.findMany({
    where: { ownerId },
  });

  return NextResponse.json(institutions);
}