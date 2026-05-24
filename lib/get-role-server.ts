// FILE: lib/get-role-server.ts
// SERVER COMPONENTS ONLY
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
// FIX: @/* = project root per tsconfig, so lib/ not src/lib/
import { prismaRoleToApp, isValidRole, type AppRole } from "./roles";
import { DEV_ROLE_COOKIE, type ResolvedSession } from "./get-role";
import { Role } from "@/src/generated/client/wasm";

export async function getResolvedSession(): Promise<ResolvedSession | null> {
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await cookies();

  // DEV: return mock session from dev cookie
  if (isDev) {
    const devRole = cookieStore.get(DEV_ROLE_COOKIE)?.value;
    if (devRole && isValidRole(devRole)) {
      const dbRoleEnum = devRole.toUpperCase().replace("-", "_") as Role;
      const formattedName = devRole
        .replace("-", " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      return {
        role: devRole,
        dbRole: dbRoleEnum,
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

  // FIX: fetch user row WITHOUT the nested Institution join to avoid 406.
  // Fetch institution separately.
  const { data: dbUser, error } = await supabase
    .from("User")
    .select("role, name, institutionId")
    .eq("id", authUser.id)
    .single();

  if (error || !dbUser) return null;

  const role = prismaRoleToApp(dbUser.role ?? "STUDENT");

  let institutionName: string | null = null;
  if (dbUser.institutionId) {
    const { data: inst } = await supabase
      .from("Institution")
      .select("name")
      .eq("id", dbUser.institutionId)
      .single();
    institutionName = inst?.name ?? null;
  }

  return {
    role,
    dbRole: dbUser.role as Role,
    userId: authUser.id,
    email: authUser.email ?? null,
    name: dbUser.name ?? authUser.email ?? null,
    institutionId: dbUser.institutionId ?? null,
    institutionName,
    isDevOverride: false,
  };
}
