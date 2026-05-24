// src/lib/subscription-guard.ts

import { prisma } from "@/lib/prisma";


/**
 * Checks if an institution has access based on its subscription status.
 */
export async function verifyInstitutionAccess(institutionId: string): Promise<{ allowed: boolean; reason?: string }> {
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId }
  });

  if (!institution) {
    return { allowed: false, reason: "শিক্ষা প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।" };
  }

  // 1. Instantly capture explicit manual pauses
  if (institution.status === "SUSPENDED") {
    return { allowed: false, reason: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। দয়া করে বকেয়া পরিশোধ করুন।" };
  }

  // 2. Safe Null-Check for Date Comparison
  const now = new Date();
  
  // Checking if expiresAt exists before trying to evaluate `< now`
  if (institution.autoPause && institution.expiresAt && new Date(institution.expiresAt) < now) {
    
    // Automatically flag status mutation inside PostgreSQL records
    await prisma.institution.update({
      where: { id: institutionId },
      data: { status: "SUSPENDED" }
    });
    
    return { allowed: false, reason: "আপনার ফ্রি ট্রায়ালের মেয়াদ শেষ হয়েছে! সার্ভিস সচল রাখতে সাবস্ক্রিপশন ফি জমা দিন।" };
  }

  return { allowed: true };
}