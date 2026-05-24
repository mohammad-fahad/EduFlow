import { prisma } from "@/lib/prisma";
import CentralHubDashboard from "./components/CentralHubDashboard";
export const dynamic = "force-dynamic";

export default async function Page() {
  // Database calls are only allowed here
  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <CentralHubDashboard initialData={institutions} />;
}