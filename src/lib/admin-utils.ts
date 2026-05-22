// src/lib/admin-utils.ts
export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  
  // Use the exact key from your .env file
  const adminList = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(",") || [];
  
  // Trim whitespace and compare
  return adminList.map(e => e.trim()).includes(email.trim());
}