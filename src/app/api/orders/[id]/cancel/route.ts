import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";
import { canCompanyCancel, cancelOrderInputSchema } from "@/modules/orders/domain/order-workflow";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  const walletId = company?.wallet?.id;
  if (!company || !walletId) return apiError(409, "BILLETERA_REQUERIDA", "El negocio no tiene una billetera activa.");
  const parsed = cancelOrderInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "MOTIVO_INVALIDO", "Indica un motivo de cancelacion valido.", parsed.error.flatten());
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 120) return apiError(400, "IDEMPOTENCY_KEY_REQUERIDA", "Envia una clave Idempotency-Key valida.");
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.walletTransaction.findUnique({ where: { idempotencyKey }, select: { orderId: true } });
      if (prior) {
        if (prior.orderId !== id) throw new Error("IDEMPOTENCY_KEY_REUSED");
        return tx.deliveryOrder.findUniqueOrThrow({ where: { id }, select: { id: true, publicCode: true, status: true, cancelledAt: true } });
      }

      const order = await tx.deliveryOrder.findFirst({
        where: { id, companyId: company.id },
        select: { id: true, publicCode: true, status: true, companyPrice: true },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status === "CANCELLED") return { id: order.id, publicCode: order.publicCode, status: order.status, cancelledAt: null };
      if (!canCompanyCancel(order.status)) throw new Error("ORDER_CANNOT_BE_CANCELLED");

      const cancelledAt = new Date();
      const cancelled = await tx.deliveryOrder.updateMany({
        where: { id, companyId: company.id, status: order.status },
        data: { status: "CANCELLED", cancelledAt, cancellationReason: parsed.data.reason },
      });
      if (cancelled.count !== 1) throw new Error("CONCURRENT_TRANSITION");

      if (order.status !== "DRAFT") {
        const released = await tx.wallet.updateMany({
          where: { id: walletId, reservedBalance: { gte: order.companyPrice } },
          data: { availableBalance: { increment: order.companyPrice }, reservedBalance: { decrement: order.companyPrice }, version: { increment: 1 } },
        });
        if (released.count !== 1) throw new Error("RESERVATION_NOT_FOUND");
        const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId }, select: { availableBalance: true, reservedBalance: true } });
        await tx.walletTransaction.create({
          data: { walletId, orderId: id, type: "RELEASE", amount: order.companyPrice, availableAfter: wallet.availableBalance, reservedAfter: wallet.reservedBalance, idempotencyKey, description: `Liberacion por cancelacion de ${order.publicCode}` },
        });
      }

      await tx.orderStatusEvent.create({
        data: { orderId: id, fromStatus: order.status, toStatus: "CANCELLED", actorId: access.user.id, actorRole: access.user.role, comment: parsed.data.reason },
      });
      return { id: order.id, publicCode: order.publicCode, status: "CANCELLED" as const, cancelledAt };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no pertenece a tu negocio.");
    if (error instanceof Error && error.message === "ORDER_CANNOT_BE_CANCELLED") return apiError(409, "CANCELACION_NO_PERMITIDA", "El pedido ya fue recogido o finalizado y requiere revision administrativa.");
    if (error instanceof Error && error.message === "RESERVATION_NOT_FOUND") return apiError(409, "RESERVA_NO_DISPONIBLE", "No se encontro el saldo reservado para devolver.");
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") return apiError(409, "IDEMPOTENCY_KEY_REUTILIZADA", "La clave ya fue utilizada para otra operacion.");
    if (error instanceof Error && error.message === "CONCURRENT_TRANSITION") return apiError(409, "CONCURRENCIA_DETECTADA", "El estado cambio mientras cancelabas. Actualiza el pedido.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico el pedido. Reintenta con la misma clave.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "OPERACION_DUPLICADA", "La operacion ya fue procesada.");
    throw error;
  }
}
