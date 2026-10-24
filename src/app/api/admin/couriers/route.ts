import { NextResponse } from "next/server";

import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const couriers = await prisma.courierProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, documentType: true, documentNumber: true, phone: true, vehiclePlate: true,
      approvalStatus: true, reviewedAt: true, reviewReason: true, createdAt: true,
      user: { select: { id: true, name: true, email: true, status: true } },
      reviewedBy: { select: { name: true } },
      _count: { select: { assignedOrders: true } },
    },
  });
  return NextResponse.json({ data: couriers });
}
