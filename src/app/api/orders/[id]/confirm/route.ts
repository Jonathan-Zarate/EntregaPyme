import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  const walletId = company?.wallet?.id;
  if (!company || !walletId) return apiError(409, "BILLETERA_REQUERIDA", "El negocio no tiene una billetera activa.");

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 120) {
    return apiError(400, "IDEMPOTENCY_KEY_REQUERIDA", "Envia una clave Idempotency-Key valida.");
  }
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.walletTransaction.findUnique({ where: { idempotencyKey }, select: { orderId: true } });
      if (prior) {
        if (prior.orderId !== id) throw new Error("IDEMPOTENCY_KEY_REUSED");
        return tx.deliveryOrder.findUniqueOrThrow({ where: { id }, select: { id: true, publicCode: true, status: true, companyPrice: true } });
      }

      const order = await tx.deliveryOrder.findFirst({
        where: { id, companyId: company.id },
        select: { id: true, publicCode: true, status: true, companyPrice: true },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== "DRAFT") throw new Error("ORDER_NOT_DRAFT");

      const reserved = await tx.wallet.updateMany({
        where: { id: walletId, availableBalance: { gte: order.companyPrice } },
        data: { availableBalance: { decrement: order.companyPrice }, reservedBalance: { increment: order.companyPrice }, version: { increment: 1 } },
      });
      if (reserved.count !== 1) throw new Error("INSUFFICIENT_BALANCE");

      const confirmed = await tx.deliveryOrder.updateMany({
        where: { id: order.id, status: "DRAFT" },
        data: { status: "PENDING_ASSIGNMENT", confirmedAt: new Date() },
      });
      if (confirmed.count !== 1) throw new Error("ORDER_ALREADY_CONFIRMED");

      const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId }, select: { availableBalance: true, reservedBalance: true } });
      await tx.walletTransaction.create({
        data: {
          walletId, orderId: order.id, type: "RESERVE", amount: order.companyPrice,
          availableAfter: wallet.availableBalance, reservedAfter: wallet.reservedBalance, idempotencyKey,
          description: `Reserva para ${order.publicCode}`,
        },
      });
      await tx.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: "DRAFT", toStatus: "PENDING_ASSIGNMENT", actorId: access.user.id, actorRole: access.user.role },
      });

      return { ...order, status: "PENDING_ASSIGNMENT" as const };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ data: { ...result, companyPrice: result.companyPrice.toFixed(2) } });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") return apiError(409, "SALDO_INSUFICIENTE", "El saldo disponible no cubre el pedido.");
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no existe.");
    if (error instanceof Error && ["ORDER_NOT_DRAFT", "ORDER_ALREADY_CONFIRMED"].includes(error.message)) return apiError(409, "PEDIDO_YA_CONFIRMADO", "El pedido ya fue confirmado o no puede confirmarse.");
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") return apiError(409, "IDEMPOTENCY_KEY_REUTILIZADA", "La clave ya fue utilizada para otra operacion.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "OPERACION_DUPLICADA", "La operacion ya fue procesada.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico el saldo. Reintenta con la misma clave.");
    throw error;
  }
}
