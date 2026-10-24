import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { updateRateInputSchema } from "@/modules/rates/domain/rate-input";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const body = await request.json().catch(() => null);
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.deliveryRate.findUnique({ where: { id }, select: { id: true, originDistrictId: true, destinationDistrictId: true, active: true } });
      if (!current) throw new Error("RATE_NOT_FOUND");
      if (!current.active) throw new Error("RATE_NOT_ACTIVE");
      const now = new Date();
      const closed = await tx.deliveryRate.updateMany({ where: { id, active: true }, data: { active: false, validUntil: now } });
      if (closed.count !== 1) throw new Error("RATE_NOT_ACTIVE");

      if (body?.active === false) {
        await tx.auditLog.create({ data: { actorId: access.user.id, action: "RATE_DEACTIVATED", entityType: "DeliveryRate", entityId: id } });
        return { id, active: false, replacementId: null };
      }

      const parsed = updateRateInputSchema.safeParse(body);
      if (!parsed.success) throw new Error("INVALID_RATE");
      const replacement = await tx.deliveryRate.create({ data: { originDistrictId: current.originDistrictId, destinationDistrictId: current.destinationDistrictId, companyPrice: parsed.data.companyPrice, courierPayment: parsed.data.courierPayment, validFrom: now }, select: { id: true } });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "RATE_VERSIONED", entityType: "DeliveryRate", entityId: replacement.id, metadata: { previousRateId: id, companyPrice: parsed.data.companyPrice, courierPayment: parsed.data.courierPayment } } });
      return { id, active: false, replacementId: replacement.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_NOT_FOUND") return apiError(404, "TARIFA_NO_ENCONTRADA", "La tarifa no existe.");
    if (error instanceof Error && error.message === "RATE_NOT_ACTIVE") return apiError(409, "TARIFA_NO_ACTIVA", "La tarifa ya fue reemplazada o desactivada.");
    if (error instanceof Error && error.message === "INVALID_RATE") return apiError(422, "TARIFA_INVALIDA", "Revisa el precio y el pago al motorizado.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "TARIFA_ACTIVA_EXISTENTE", "Ya existe una tarifa activa para esta ruta.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico la tarifa. Actualiza la lista.");
    throw error;
  }
}
