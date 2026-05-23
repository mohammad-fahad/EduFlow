// FILE: src/app/dashboard/parent/page.tsx
import { getResolvedSession } from "@/src/lib/get-role-server";
import { redirect } from "next/navigation";
import { can } from "@/src/lib/permissions";

export default async function ParentPage() {
  const session = await getResolvedSession();

  // Server-side role guard
  if (!session) redirect("/login");
  if (session.role !== "parent" && session.role !== "super-admin") {
    redirect("/unauthorized?from=/dashboard/parent");
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-tight text-slate-800">
          অভিভাবক ড্যাশবোর্ড
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          সন্তানের তথ্য দেখুন
          {session.isDevOverride && (
            <span className="ml-2 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              DEV MODE
            </span>
          )}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatPlaceholder label="মোট শিক্ষার্থী" value="—" accent="blue" />
        <StatPlaceholder label="আজকের উপস্থিতি" value="—" accent="green" />
        <StatPlaceholder label="সংগৃহীত ফি" value="—" accent="gold" />
        <StatPlaceholder label="মোট শিক্ষক" value="—" accent="silver" />
      </div>

      {/* Session info (dev helper) */}
      {session.isDevOverride && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-widest mb-2">
            Dev Session Info
          </p>
          <pre className="text-[11px] text-yellow-800 whitespace-pre-wrap">
            {JSON.stringify({ role: session.role, userId: session.userId, institutionName: session.institutionName }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function StatPlaceholder({
  label,
  value,
  accent,
}: {
  label:  string;
  value:  string;
  accent: "blue" | "green" | "gold" | "silver";
}) {
  const borders: Record<string, string> = {
    blue:   "border-t-blue-400",
    green:  "border-t-neon-400",
    gold:   "border-t-yellow-400",
    silver: "border-t-slate-400",
  };
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-t-[2.5px] ${borders[accent]} p-5 shadow-sm`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
      <p className="font-display text-[26px] font-bold tracking-tight text-slate-800">{value}</p>
    </div>
  );
}
