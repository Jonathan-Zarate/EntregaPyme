import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";
import { orderInputSchema } from "@/modules/orders/domain/order-input";
import { findActiveRate } from "@/modules/orders/server/active-rate";

export async function GET() {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de consultar pedidos.");

  const orders = await prisma.deliveryOrder.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, publicCode: true, status: true, companyPrice: true, recipientName: true,
      pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, createdAt: true,
    },
  });
  return NextResponse.json({ data: orders.map((order) => ({ ...order, companyPrice: order.companyPrice.toFixed(2) })) });
}

export async function POST(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de crear pedidos.");

  const parsed = orderInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "DATOS_INVALIDOS", "Revisa los datos del pedido.", parsed.error.flatten());

  const rate = await findActiveRate(prisma, parsed.data.pickupDistrictId, parsed.data.deliveryDistrictId);
  if (!rate) return apiError(404, "TARIFA_NO_DISPONIBLE", "Aun no existe una tarifa para esta ruta.");

  const order = await prisma.deliveryOrder.create({
    data: {
      ...parsed.data,
      publicCode: `EP-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
      companyId: company.id,
      createdById: access.user.id,
      rateId: rate.id,
      companyPrice: rate.companyPrice,
      courierPayment: rate.courierPayment,
      platformMargin: rate.companyPrice.minus(rate.courierPayment),
    },
    select: { id: true, publicCode: true, status: true, companyPrice: true },
  });

  return NextResponse.json({ data: { ...order, companyPrice: order.companyPrice.toFixed(2) } }, { status: 201 });
}
