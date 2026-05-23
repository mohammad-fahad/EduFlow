import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ১. CREATE NOTICE (POST)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, institutionId: true },
    });

    if (!dbUser || !dbUser.institutionId) {
      return NextResponse.json(
        { error: "User has no institution" },
        { status: 403 },
      );
    }

    if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 },
      );
    }

    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
        authorId: authUser.id,
        institutionId: dbUser.institutionId,
      },
    });

    return NextResponse.json(
      { success: true, data: newNotice },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
