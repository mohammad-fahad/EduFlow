// src/app/dashboard/layout.tsx

import DashboardLayout from "../component/dashboard/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
