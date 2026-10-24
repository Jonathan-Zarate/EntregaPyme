import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { topUpReviewSchema } from "@/modules/top-ups/domain/top-up-input";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = topUpReviewSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success || !parsed.data.reason) return apiError(422, "MOTIVO_REQUERIDO", "Indica por que se rechaza la recarga.");
  const { id } = await context.params;

  const result = await prisma.$transaction(async (tx) => {
    const rejected = await tx.topUp.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: access.user.id, reviewReason: parsed.data.reason },
    });
    if (rejected.count !== 1) return null;
    await tx.auditLog.create({ data: { actorId: access.user.id, action: "TOP_UP_REJECTED", entityType: "TopUp", entityId: id, metadata: { reason: parsed.data.reason } } });
    return { id, status: "REJECTED" as const };
  });
  if (!result) return apiError(409, "RECARGA_YA_REVISADA", "La recarga no existe o ya fue revisada.");
  return NextResponse.json({ data: result });
}
