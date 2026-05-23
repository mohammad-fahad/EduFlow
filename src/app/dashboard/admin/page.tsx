// FILE: src/app/dashboard/admin/page.tsx  (same pattern for all 6 role pages)
// Change this one import in every role page:
//   FROM: import { getResolvedSession } from "@/lib/get-role";
//   TO:   import { getResolvedSession } from "@/lib/get-role-server";
import { getResolvedSession } from "@/src/lib/get-role-server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getResolvedSession();
  if (!session) redirect("/login");
  if (session.role !== "admin" && session.role !== "super-admin") {
    redirect("/unauthorized?from=/dashboard/admin");
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-tight text-slate-800">
          প্রধান শিক্ষক ড্যাশবোর্ড
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          প্রতিষ্ঠানের সব কার্যক্রম পরিচালনা করুন
          {session.isDevOverride && (
            <span className="ml-2 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              DEV MODE
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "মোট শিক্ষার্থী", accent: "blue-400" },
          { label: "আজকের উপস্থিতি", accent: "neon-400" },
          { label: "সংগৃহীত ফি", accent: "yellow-400" },
          { label: "মোট শিক্ষক", accent: "slate-400" },
        ].map(({ label, accent }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border border-slate-200 border-t-[2.5px] border-t-${accent} p-5 shadow-sm`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {label}
            </p>
            <p className="font-display text-[26px] font-bold tracking-tight text-slate-800">
              —
            </p>
          </div>
        ))}
      </div>

      {session.isDevOverride && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-widest mb-2">
            Dev Session
          </p>
          <pre className="text-[11px] text-yellow-800">
            {JSON.stringify(
              { role: session.role, institution: session.institutionName },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
