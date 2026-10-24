import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const { id } = await context.params;
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: { company: { select: { legalName: true, tradeName: true, ruc: true } }, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, assignedCourier: { select: { id: true, phone: true, vehiclePlate: true, user: { select: { name: true, email: true } } } }, statusEvents: { orderBy: { createdAt: "asc" }, select: { id: true, fromStatus: true, toStatus: true, actorRole: true, comment: true, createdAt: true, actor: { select: { name: true } } } }, evidence: { orderBy: { createdAt: "asc" }, select: { id: true, type: true, url: true, comment: true, createdAt: true } } },
  });
  if (!order) return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no existe.");
  return NextResponse.json({ data: { ...order, companyPrice: order.companyPrice.toFixed(2), courierPayment: order.courierPayment.toFixed(2), platformMargin: order.platformMargin.toFixed(2) } });
}
