import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { can } from "@/lib/permissions"; // 👈 আপনার তৈরি করা পারমিশন ম্যাট্রিক্স
import { type AppRole } from "@/lib/roles";

// নেক্সট জেএস-কে প্রতি রিকোয়েস্টে লাইভ ডাটাবেজ চেক করতে বাধ্য করা (ক্যাশ ক্লিয়ার করতে)
export const dynamic = "force-dynamic";

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

  if (!dbUser) {
    return { notices: [], canCreateNotice: false, dbUser: null, appRole: null };
  }

  // 🛠️ ডাটাবেজের UPPERCASE রোলকে আপনার পারমিশন ফাইলের lowercase রোলে কনভার্ট করা
  const appRole = dbUser.role.toLowerCase().replace("_", "-") as AppRole;

  // আপনার permissions.ts থেকে নোটিশ দেখার পারমিশন চেক করা
  const canViewNotice = can(appRole, "notices:view");
  if (!canViewNotice) {
    return { notices: [], canCreateNotice: false, dbUser, appRole };
  }

  // নোটিশ ফেচ করার লজিক (SUPER_ADMIN হলে সব স্কুলের নোটিশ, অন্যথায় শুধু নিজের স্কুলের নোটিশ)
  const notices = await prisma.notice.findMany({
    where:
      appRole === "super-admin"
        ? {}
        : { institutionId: dbUser.institutionId || "" },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, role: true },
      },
    },
  });

  // permissions.ts ফাইল থেকে নোটিশ তৈরি করার পারমিশন চেক করা
  const canCreateNotice = can(appRole, "notices:create");

  return { notices, canCreateNotice, dbUser, appRole };
}

export default async function NoticeBoardPage() {
  const { notices, canCreateNotice, dbUser, appRole } =
    await getNoticesAndPermissions();

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
        // সুপার এডমিনদের জন্য প্রথম প্রতিষ্ঠানের আইডি ডামি হিসেবে বা নির্দিষ্ট আইডি দেওয়া যেতে পারে
        institutionId: dbUser.institutionId || "SUPER_ADMIN_GLOBAL",
      },
    });

    revalidatePath("/dashboard/notices");
  }

  // যদি ইউজার ডাটাবেজে না থাকে বা রোল এরর হয়
  if (!dbUser) {
    return (
      <div className="p-6 text-center text-red-500">
        User configuration error. Contact support.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* বাম পাশ: নোটিশ বোর্ড তালিকা */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Notice Board
          </h1>
          <p className="text-gray-500 mt-1">
            Official announcements and updates
          </p>
          <p className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
            DB Role: <span className="font-bold">{dbUser.role}</span> | System
            Role: <span className="font-bold">{appRole}</span>
          </p>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500 text-lg">No notices posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <article
                key={notice.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {notice.title}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {notice.content}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-2">
                  <div>
                    By:{" "}
                    <span className="font-medium text-gray-700">
                      {notice.author?.name || "User"}
                    </span>{" "}
                    ({notice.author?.role})
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ডান পাশ: নোটিশ ক্রিয়েশন প্যানেল */}
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
                  className="w-full border border-gray-300 rounded-lg p-2.5"
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
                  className="w-full border border-gray-300 rounded-lg p-2.5"
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
            🔒 You are logged in as a view-only user. Only roles with
            notice-creation power can post.
          </div>
        )}
      </div>
    </div>
  );
}
