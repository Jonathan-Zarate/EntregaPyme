import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";
import { paginationSchema } from "@/modules/shared/domain/pagination";

export async function GET(request: Request) {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const courier = await findApprovedCourier(prisma, access.user.id);
  if (!courier) return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado.");
  const parsed = paginationSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError(422, "PAGINACION_INVALIDA", "Revisa la pagina y el limite.");
  const { page, limit } = parsed.data;
  const where = { assignedCourierId: courier.id, status: { in: ["DELIVERED" as const, "CANCELLED" as const] } };
  const [total, orders] = await prisma.$transaction([
    prisma.deliveryOrder.count({ where }),
    prisma.deliveryOrder.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, publicCode: true, status: true, courierPayment: true, deliveredAt: true, cancelledAt: true, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } } } }),
  ]);
  return NextResponse.json({ data: orders.map((order) => ({ ...order, courierPayment: order.courierPayment.toFixed(2) })), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
}
