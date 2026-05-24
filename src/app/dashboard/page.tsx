// FILE: src/app/dashboard/page.tsx
// FIX: The old page had hardcoded mock data and never redirected.
// Now it reads the real session and bounces to the correct role dashboard.
import { getResolvedSession } from "@/lib/get-role-server";
import { redirect } from "next/navigation";
import { ROLE_META } from "@/lib/roles";

export default async function DashboardIndexPage() {
  const session = await getResolvedSession();
  if (!session) redirect("/login");
  // Redirect to the role-specific home page
  redirect(ROLE_META[session.role].dashboardPath);
}
