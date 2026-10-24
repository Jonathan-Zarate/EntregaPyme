import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";
import { isValidCourierTransition, orderStatusInputSchema } from "@/modules/orders/domain/order-workflow";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const parsed = orderStatusInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "ESTADO_INVALIDO", "Revisa el estado solicitado.", parsed.error.flatten());
  const { id } = await context.params;
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (parsed.data.toStatus === "DELIVERED" && (!idempotencyKey || idempotencyKey.length > 120)) {
    return apiError(400, "IDEMPOTENCY_KEY_REQUERIDA", "Finalizar una entrega requiere una clave Idempotency-Key valida.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const courier = await findApprovedCourier(tx, access.user.id);
      if (!courier) throw new Error("COURIER_NOT_APPROVED");
      if (parsed.data.toStatus === "DELIVERED" && idempotencyKey) {
        const prior = await tx.walletTransaction.findUnique({ where: { idempotencyKey }, select: { orderId: true } });
        if (prior) {
          if (prior.orderId !== id) throw new Error("IDEMPOTENCY_KEY_REUSED");
          return tx.deliveryOrder.findUniqueOrThrow({ where: { id }, select: { id: true, publicCode: true, status: true, deliveredAt: true } });
        }
      }

      const order = await tx.deliveryOrder.findFirst({
        where: { id, assignedCourierId: courier.id },
        select: { id: true, publicCode: true, status: true, companyId: true, companyPrice: true, _count: { select: { evidence: true } } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status === parsed.data.toStatus) return { id: order.id, publicCode: order.publicCode, status: order.status, deliveredAt: null };
      if (!isValidCourierTransition(order.status, parsed.data.toStatus)) throw new Error("INVALID_TRANSITION");
      if (parsed.data.toStatus === "DELIVERED" && order._count.evidence === 0) throw new Error("EVIDENCE_REQUIRED");

      const changed = await tx.deliveryOrder.updateMany({
        where: { id, assignedCourierId: courier.id, status: order.status },
        data: {
          status: parsed.data.toStatus,
          ...(parsed.data.toStatus === "PICKED_UP" ? { pickedUpAt: new Date() } : {}),
          ...(parsed.data.toStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        },
      });
      if (changed.count !== 1) throw new Error("CONCURRENT_TRANSITION");

      if (parsed.data.toStatus === "DELIVERED" && idempotencyKey) {
        const wallet = await tx.wallet.findUniqueOrThrow({ where: { companyId: order.companyId }, select: { id: true, availableBalance: true, reservedBalance: true } });
        const captured = await tx.wallet.updateMany({
          where: { id: wallet.id, reservedBalance: { gte: order.companyPrice } },
          data: { reservedBalance: { decrement: order.companyPrice }, version: { increment: 1 } },
        });
        if (captured.count !== 1) throw new Error("RESERVATION_NOT_FOUND");
        const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id }, select: { availableBalance: true, reservedBalance: true } });
        await tx.walletTransaction.create({
          data: { walletId: wallet.id, orderId: id, type: "CAPTURE", amount: order.companyPrice, availableAfter: updatedWallet.availableBalance, reservedAfter: updatedWallet.reservedBalance, idempotencyKey, description: `Cobro definitivo de ${order.publicCode}` },
        });
      }

      await tx.orderStatusEvent.create({
        data: { orderId: id, fromStatus: order.status, toStatus: parsed.data.toStatus, actorId: access.user.id, actorRole: access.user.role, comment: parsed.data.comment },
      });
      return tx.deliveryOrder.findUniqueOrThrow({ where: { id }, select: { id: true, publicCode: true, status: true, deliveredAt: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "COURIER_NOT_APPROVED") return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado para operar.");
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no esta asignado a tu perfil.");
    if (error instanceof Error && error.message === "INVALID_TRANSITION") return apiError(409, "TRANSICION_INVALIDA", "El pedido debe avanzar un estado a la vez.");
    if (error instanceof Error && error.message === "EVIDENCE_REQUIRED") return apiError(409, "EVIDENCIA_REQUERIDA", "Registra una evidencia antes de finalizar la entrega.");
    if (error instanceof Error && error.message === "RESERVATION_NOT_FOUND") return apiError(409, "RESERVA_NO_DISPONIBLE", "No se encontro el saldo reservado del pedido.");
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") return apiError(409, "IDEMPOTENCY_KEY_REUTILIZADA", "La clave ya fue utilizada para otra operacion.");
    if (error instanceof Error && error.message === "CONCURRENT_TRANSITION") return apiError(409, "CONCURRENCIA_DETECTADA", "El estado cambio mientras operabas. Actualiza el pedido.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico el pedido. Reintenta.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "OPERACION_DUPLICADA", "La operacion ya fue procesada.");
    throw error;
  }
}
