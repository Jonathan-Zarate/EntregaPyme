import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type Database = PrismaClient | Prisma.TransactionClient;

export function findActiveRate(db: Database, pickupDistrictId: string, deliveryDistrictId: string, now = new Date()) {
  return db.deliveryRate.findFirst({
    where: {
      originDistrictId: pickupDistrictId,
      destinationDistrictId: deliveryDistrictId,
      active: true,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      originDistrict: { active: true },
      destinationDistrict: { active: true },
    },
    orderBy: { validFrom: "desc" },
    select: {
      id: true,
      companyPrice: true,
      courierPayment: true,
      originDistrict: { select: { id: true, name: true } },
      destinationDistrict: { select: { id: true, name: true } },
    },
  });
}
