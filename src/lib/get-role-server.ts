// FILE: src/lib/get-role-server.ts
// SERVER COMPONENTS ONLY — never import from "use client" files
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prismaRoleToApp, isValidRole, type AppRole } from "./roles";
import { DEV_ROLE_COOKIE, type ResolvedSession } from "./get-role";

export async function getResolvedSession(): Promise<ResolvedSession | null> {
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await cookies();

  if (isDev) {
    const devRole = cookieStore.get(DEV_ROLE_COOKIE)?.value;
    if (devRole && isValidRole(devRole)) {
      return {
        role: devRole,
        userId: "dev-user-id",
        email: `dev-${devRole}@eduflow.dev`,
        name: `Dev ${devRole.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
        institutionId: "dev-institution-id",
        institutionName: "EduFlow Dev School",
        isDevOverride: true,
      };
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: dbUser } = await supabase
    .from("User")
    .select("role, name, institutionId, institution:Institution(name)")
    .eq("id", authUser.id)
    .single();

  if (!dbUser) return null;

  const role = prismaRoleToApp(dbUser.role ?? "STUDENT");
  const institutionData = dbUser.institution as { name?: string } | null;

  return {
    role,
    userId: authUser.id,
    email: authUser.email ?? null,
    name: dbUser.name ?? authUser.email ?? null,
    institutionId: dbUser.institutionId ?? null,
    institutionName: institutionData?.name ?? null,
    isDevOverride: false,
  };
}
