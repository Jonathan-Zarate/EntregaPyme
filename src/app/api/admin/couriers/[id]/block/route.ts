import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { blockCourierInputSchema } from "@/modules/couriers/domain/courier-review";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = blockCourierInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "MOTIVO_INVALIDO", "Indica un motivo de bloqueo valido.", parsed.error.flatten());
  const { id } = await context.params;

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.courierProfile.findUnique({ where: { id }, select: { id: true, userId: true, approvalStatus: true } });
    if (!profile) return null;
    const reviewedAt = new Date();
    const courier = await tx.courierProfile.update({
      where: { id },
      data: { approvalStatus: "BLOCKED", reviewedAt, reviewedById: access.user.id, reviewReason: parsed.data.reason },
      select: { id: true, approvalStatus: true, reviewedAt: true, reviewReason: true },
    });
    await tx.user.update({ where: { id: profile.userId }, data: { status: "BLOCKED", banned: true, banReason: parsed.data.reason } });
    await tx.session.deleteMany({ where: { userId: profile.userId } });
    await tx.auditLog.create({ data: { actorId: access.user.id, action: "COURIER_BLOCKED", entityType: "CourierProfile", entityId: id, metadata: { reason: parsed.data.reason, previousStatus: profile.approvalStatus } } });
    return courier;
  });
  if (!result) return apiError(404, "MOTORIZADO_NO_ENCONTRADO", "El perfil de motorizado no existe.");
  return NextResponse.json({ data: result });
}
