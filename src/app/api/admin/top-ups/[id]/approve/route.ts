import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 120) return apiError(400, "IDEMPOTENCY_KEY_REQUERIDA", "Envia una clave Idempotency-Key valida.");
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.walletTransaction.findUnique({ where: { idempotencyKey }, select: { topUpId: true } });
      if (prior) {
        if (prior.topUpId !== id) throw new Error("IDEMPOTENCY_KEY_REUSED");
        return tx.topUp.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, amount: true } });
      }

      const topUp = await tx.topUp.findUnique({ where: { id }, select: { id: true, companyId: true, amount: true, status: true } });
      if (!topUp) throw new Error("TOP_UP_NOT_FOUND");
      if (topUp.status !== "PENDING") throw new Error("TOP_UP_ALREADY_REVIEWED");

      const reviewed = await tx.topUp.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: access.user.id, reviewReason: null },
      });
      if (reviewed.count !== 1) throw new Error("TOP_UP_ALREADY_REVIEWED");

      const wallet = await tx.wallet.update({
        where: { companyId: topUp.companyId },
        data: { availableBalance: { increment: topUp.amount }, version: { increment: 1 } },
        select: { id: true, availableBalance: true, reservedBalance: true },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id, topUpId: topUp.id, type: "TOP_UP", amount: topUp.amount,
          availableAfter: wallet.availableBalance, reservedAfter: wallet.reservedBalance, idempotencyKey,
          description: "Recarga manual aprobada",
        },
      });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "TOP_UP_APPROVED", entityType: "TopUp", entityId: topUp.id, metadata: { amount: topUp.amount.toFixed(2) } } });
      return { id: topUp.id, status: "APPROVED" as const, amount: topUp.amount };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ data: { ...result, amount: result.amount.toFixed(2) } });
  } catch (error) {
    if (error instanceof Error && error.message === "TOP_UP_NOT_FOUND") return apiError(404, "RECARGA_NO_ENCONTRADA", "La recarga no existe.");
    if (error instanceof Error && error.message === "TOP_UP_ALREADY_REVIEWED") return apiError(409, "RECARGA_YA_REVISADA", "La recarga ya fue aprobada o rechazada.");
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") return apiError(409, "IDEMPOTENCY_KEY_REUTILIZADA", "La clave ya fue usada para otra operacion.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra operacion modifico la recarga. Reintenta con la misma clave.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "OPERACION_DUPLICADA", "La operacion ya fue procesada.");
    throw error;
  }
}
