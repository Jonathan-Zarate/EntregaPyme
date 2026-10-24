import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";

export async function GET() {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const courier = await findApprovedCourier(prisma, access.user.id);
  if (!courier) return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado.");
  const aggregate = await prisma.deliveryOrder.aggregate({ where: { assignedCourierId: courier.id, status: "DELIVERED" }, _sum: { courierPayment: true }, _count: { id: true } });
  return NextResponse.json({ data: { deliveredServices: aggregate._count.id, totalEarnings: aggregate._sum.courierPayment?.toFixed(2) ?? "0.00", currency: "PEN" } });
}
