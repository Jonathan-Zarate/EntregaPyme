import "server-only";

import { prisma } from "@/lib/prisma";

export async function findCompanyForUser(userId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: { userId, company: { active: true } },
    select: { role: true, companyId: true, company: { select: { id: true, wallet: { select: { id: true } } } } },
  });

  return membership?.company ?? null;
}
