import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type Database = PrismaClient | Prisma.TransactionClient;

export function findApprovedCourier(database: Database, userId: string) {
  return database.courierProfile.findFirst({
    where: { userId, approvalStatus: "APPROVED", user: { status: "ACTIVE", banned: false } },
    select: { id: true, userId: true, phone: true, vehiclePlate: true, approvalStatus: true },
  });
}
