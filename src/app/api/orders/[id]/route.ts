import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COMPANY", "COURIER");
  if ("error" in access) return access.error;
  const { id } = await context.params;
  let ownership: { companyId?: string; assignedCourierId?: string } = {};
  if (access.user.role === "COMPANY") {
    const company = await findCompanyForUser(access.user.id);
    if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de consultar pedidos.");
    ownership = { companyId: company.id };
  } else {
    const courier = await prisma.courierProfile.findUnique({ where: { userId: access.user.id }, select: { id: true } });
    if (!courier) return apiError(404, "PERFIL_NO_ENCONTRADO", "El perfil de motorizado no existe.");
    ownership = { assignedCourierId: courier.id };
  }
  const order = await prisma.deliveryOrder.findFirst({
    where: { id, ...ownership },
    include: { pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, assignedCourier: { select: { phone: true, vehiclePlate: true, user: { select: { name: true } } } }, statusEvents: { orderBy: { createdAt: "asc" }, select: { id: true, fromStatus: true, toStatus: true, actorRole: true, comment: true, createdAt: true, actor: { select: { name: true } } } }, evidence: { orderBy: { createdAt: "asc" }, select: { id: true, type: true, url: true, comment: true, createdAt: true } } },
  });
  if (!order) return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no existe o no pertenece a tu cuenta.");
  return NextResponse.json({ data: { ...order, companyPrice: order.companyPrice.toFixed(2), courierPayment: order.courierPayment.toFixed(2), platformMargin: order.platformMargin.toFixed(2) } });
}
