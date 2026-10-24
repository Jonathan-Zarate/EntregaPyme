import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { rateInputSchema } from "@/modules/rates/domain/rate-input";

const rateSelect = { id: true, companyPrice: true, courierPayment: true, active: true, validFrom: true, validUntil: true, originDistrict: { select: { id: true, name: true } }, destinationDistrict: { select: { id: true, name: true } }, _count: { select: { orders: true } } } satisfies Prisma.DeliveryRateSelect;

export async function GET() {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const rates = await prisma.deliveryRate.findMany({ where: { active: true }, orderBy: [{ originDistrict: { name: "asc" } }, { destinationDistrict: { name: "asc" } }], select: rateSelect });
  return NextResponse.json({ data: rates.map(serializeRate) });
}

export async function POST(request: Request) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = rateInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "TARIFA_INVALIDA", "Revisa los distritos y los importes.", parsed.error.flatten());
  try {
    const rate = await prisma.$transaction(async (tx) => {
      const districts = await tx.district.count({ where: { id: { in: [parsed.data.originDistrictId, parsed.data.destinationDistrictId] }, active: true } });
      const expected = parsed.data.originDistrictId === parsed.data.destinationDistrictId ? 1 : 2;
      if (districts !== expected) throw new Error("DISTRICT_NOT_FOUND");
      const existing = await tx.deliveryRate.findFirst({ where: { originDistrictId: parsed.data.originDistrictId, destinationDistrictId: parsed.data.destinationDistrictId, active: true }, select: { id: true } });
      if (existing) throw new Error("ACTIVE_RATE_EXISTS");
      const created = await tx.deliveryRate.create({ data: parsed.data, select: rateSelect });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "RATE_CREATED", entityType: "DeliveryRate", entityId: created.id, metadata: { companyPrice: parsed.data.companyPrice, courierPayment: parsed.data.courierPayment } } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ data: serializeRate(rate) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DISTRICT_NOT_FOUND") return apiError(422, "DISTRITO_INVALIDO", "Los distritos deben existir y estar activos.");
    if (error instanceof Error && error.message === "ACTIVE_RATE_EXISTS") return apiError(409, "TARIFA_ACTIVA_EXISTENTE", "Ya existe una tarifa activa para esta ruta.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "TARIFA_ACTIVA_EXISTENTE", "Ya existe una tarifa activa para esta ruta.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico las tarifas. Reintenta.");
    throw error;
  }
}

function serializeRate<T extends { companyPrice: Prisma.Decimal; courierPayment: Prisma.Decimal }>(rate: T) {
  return { ...rate, companyPrice: rate.companyPrice.toFixed(2), courierPayment: rate.courierPayment.toFixed(2), platformMargin: rate.companyPrice.minus(rate.courierPayment).toFixed(2) };
}
