import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getNoticesAndPermissions() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, institutionId: true, role: true },
  });

  if (!dbUser || !dbUser.institutionId) {
    return { notices: [], canCreateNotice: false, dbUser: null };
  }

  const notices = await prisma.notice.findMany({
    where: { institutionId: dbUser.institutionId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, role: true },
      },
    },
  });

  // রোল চেক
  const canCreateNotice =
    dbUser.role === "SUPER_ADMIN" || dbUser.role === "TEACHER";

  return { notices, canCreateNotice, dbUser };
}

export default async function NoticeBoardPage() {
  const {
    notices: dbNotices,
    canCreateNotice,
    dbUser,
  } = await getNoticesAndPermissions();

  // হার্ডকোডেড নোটিশের তালিকা
  const sampleNotices = [
    {
      id: "sample-1",
      title: "Welcome to the New Academic Year!",
      content:
        "We are excited to start the new academic year with all our students and staff. Please check the schedule for upcoming events.",
      createdAt: new Date().toISOString(),
      author: { name: "Admin", role: "SUPER_ADMIN" },
    },
    {
      id: "sample-2",
      title: "Parent-Teacher Meeting Scheduled",
      content:
        "The parent-teacher meeting is scheduled for next Friday. Please make sure to attend and discuss your child's progress with the teachers.",
      createdAt: new Date().toISOString(),
      author: { name: "Principal", role: "ADMIN" },
    },
  ];

  // ডাটাবেজের নোটিশ এবং হার্ডকোডেড নোটিশ একসাথে কম্বাইন করা
  // (Prisma-র টাইপ ইরর এড়াতে টাইপ কাস্টিং করা হয়েছে)
  const allNotices = [...dbNotices, ...sampleNotices] as any[];

  // সার্ভার অ্যাকশন: ফর্ম সাবমিট হ্যান্ডেল করার জন্য
  async function handleCreateNotice(formData: FormData) {
    "use server";

    if (!canCreateNotice || !dbUser) {
      throw new Error("Unauthorized action");
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await prisma.notice.create({
      data: {
        title,
        content,
        authorId: dbUser.id,
        institutionId: dbUser.institutionId!,
      },
    });

    // পেজ অটো-রিফ্রেশ করে নতুন নোটিশ দেখাবে
    revalidatePath("/dashboard/notices");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* বাম পাশ: নোটিশ দেখানোর জায়গা (সবাই দেখতে পাবে) */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Notice Board
          </h1>
          <p className="text-gray-500 mt-1">
            Official announcements and updates
          </p>
          {/* আপনার কারেন্ট রোল চেক করার জন্য একটি ডিবাগ টেক্সট */}
          <p className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
            Your Current Role:{" "}
            <span className="font-bold">{dbUser?.role || "NONE"}</span>
          </p>
        </div>

        {allNotices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500 text-lg">No notices posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allNotices.map((notice) => (
              <article
                key={notice.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                {/* নোটিশের হেডার এবং মেটাডেটা */}
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {notice.title}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* নোটিশের মূল কন্টেন্ট */}
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {notice.content}
                </p>

                {/* ফুটার এবং অ্যাকশন বাটনসমূহ (Edit/Delete) */}
                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-2">
                  <div>
                    By:{" "}
                    <span className="font-medium text-gray-700">
                      {notice.author?.name || "User"}
                    </span>
                    <span className="mx-1">({notice.author?.role})</span>
                  </div>

                  {/* এডিটিং এবং ডিলিট করার অ্যাকশন বাটন */}
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ডান পাশ: নোটিশ তৈরি করার ফর্ম */}
      <div className="lg:col-span-1">
        {canCreateNotice ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create New Notice
            </h2>

            <form action={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notice Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write notice details here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
              >
                Publish Notice
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
            🔒 You are logged in as a regular user. Only **SUPER_ADMIN** or
            **TEACHER** can create notices.
          </div>
        )}
      </div>
    </div>
  );
}
