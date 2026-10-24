import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";

export async function GET() {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const courier = await findApprovedCourier(prisma, access.user.id);
  if (!courier) return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado para consultar servicios.");

  const orders = await prisma.deliveryOrder.findMany({
    where: { status: "PENDING_ASSIGNMENT", assignedCourierId: null },
    orderBy: { confirmedAt: "asc" },
    take: 50,
    select: {
      id: true,
      publicCode: true,
      pickupAddress: true,
      pickupReference: true,
      deliveryAddress: true,
      deliveryReference: true,
      recipientName: true,
      recipientPhone: true,
      packageType: true,
      packageDescription: true,
      courierPayment: true,
      confirmedAt: true,
      company: { select: { legalName: true, tradeName: true, phone: true } },
      pickupDistrict: { select: { name: true } },
      deliveryDistrict: { select: { name: true } },
    },
  });

  return NextResponse.json({
    data: orders.map((order) => ({ ...order, courierPayment: order.courierPayment.toFixed(2) })),
  });
}
