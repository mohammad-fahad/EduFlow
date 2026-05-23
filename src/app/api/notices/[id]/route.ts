import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ইউজার অথেন্টিকেশন এবং রোল চেক করার কমন ফাংশন
async function checkPermission() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "Unauthorized", status: 401 };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true, institutionId: true },
  });

  if (!dbUser || !dbUser.institutionId) {
    return { error: "User does not belong to an institution", status: 403 };
  }

  // শুধুমাত্র ADMIN এবং TEACHER অনুমতি পাবেন
  if (dbUser.role !== "ADMIN" && dbUser.role !== "TEACHER") {
    return { error: "Forbidden: Insufficient permissions", status: 403 };
  }

  return { user: dbUser, authUser };
}

// ২. EDIT/UPDATE NOTICE (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const permission = await checkPermission();
    if (permission.error) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status },
      );
    }

    const { title, content } = await request.json();
    const noticeId = params.id;

    // নিশ্চিত করা যে নোটিশটি ওই নির্দিষ্ট ইন্সটিটিউশনেরই
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { institutionId: true },
    });

    if (
      !existingNotice ||
      existingNotice.institutionId !== permission.user?.institutionId
    ) {
      return NextResponse.json(
        { error: "Notice not found or unauthorized access" },
        { status: 404 },
      );
    }

    // নোটিশ আপডেট
    const updatedNotice = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    return NextResponse.json({ success: true, data: updatedNotice });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ৩. DELETE NOTICE (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const permission = await checkPermission();
    if (permission.error) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status },
      );
    }

    const noticeId = params.id;

    // নিশ্চিত করা যে নোটিশটি ওই নির্দিষ্ট ইন্সটিটিউশনেরই
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { institutionId: true },
    });

    if (
      !existingNotice ||
      existingNotice.institutionId !== permission.user?.institutionId
    ) {
      return NextResponse.json(
        { error: "Notice not found or unauthorized access" },
        { status: 404 },
      );
    }

    // নোটিশ ডিলিট
    await prisma.notice.delete({
      where: { id: noticeId },
    });

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
