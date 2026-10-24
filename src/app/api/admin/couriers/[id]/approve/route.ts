import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const { id } = await context.params;

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.courierProfile.findUnique({ where: { id }, select: { id: true, userId: true, approvalStatus: true } });
    if (!profile) return null;
    const reviewedAt = new Date();
    const courier = await tx.courierProfile.update({
      where: { id },
      data: { approvalStatus: "APPROVED", reviewedAt, reviewedById: access.user.id, reviewReason: null },
      select: { id: true, approvalStatus: true, reviewedAt: true },
    });
    await tx.user.update({ where: { id: profile.userId }, data: { status: "ACTIVE", banned: false, banReason: null, banExpires: null } });
    await tx.auditLog.create({ data: { actorId: access.user.id, action: "COURIER_APPROVED", entityType: "CourierProfile", entityId: id, metadata: { previousStatus: profile.approvalStatus } } });
    return courier;
  });
  if (!result) return apiError(404, "MOTORIZADO_NO_ENCONTRADO", "El perfil de motorizado no existe.");
  return NextResponse.json({ data: result });
}
