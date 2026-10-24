import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { adminOrderQuerySchema } from "@/modules/orders/domain/admin-order-input";

export async function GET(request: Request) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const url = new URL(request.url);
  const parsed = adminOrderQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return apiError(422, "FILTROS_INVALIDOS", "Revisa los filtros y la paginacion.", parsed.error.flatten());
  const { status, search, page, limit } = parsed.data;
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ publicCode: { contains: search, mode: "insensitive" as const } }, { recipientName: { contains: search, mode: "insensitive" as const } }, { company: { OR: [{ legalName: { contains: search, mode: "insensitive" as const } }, { tradeName: { contains: search, mode: "insensitive" as const } }] } }] } : {}),
  };
  const [total, orders] = await prisma.$transaction([
    prisma.deliveryOrder.count({ where }),
    prisma.deliveryOrder.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, publicCode: true, status: true, companyPrice: true, courierPayment: true, recipientName: true, createdAt: true, company: { select: { legalName: true, tradeName: true } }, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, assignedCourier: { select: { id: true, user: { select: { name: true } } } } } }),
  ]);
  return NextResponse.json({ data: orders.map((order) => ({ ...order, companyPrice: order.companyPrice.toFixed(2), courierPayment: order.courierPayment.toFixed(2) })), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
}
