import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { assignOrderInputSchema } from "@/modules/orders/domain/admin-order-input";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = assignOrderInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "ASIGNACION_INVALIDA", "Selecciona un motorizado valido.", parsed.error.flatten());
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const courier = await tx.courierProfile.findFirst({ where: { id: parsed.data.courierId, approvalStatus: "APPROVED", user: { status: "ACTIVE", banned: false } }, select: { id: true, user: { select: { name: true } } } });
      if (!courier) throw new Error("COURIER_NOT_APPROVED");
      const current = await tx.deliveryOrder.findUnique({ where: { id }, select: { id: true, publicCode: true, status: true, assignedCourierId: true } });
      if (!current) throw new Error("ORDER_NOT_FOUND");
      if (current.status === "ACCEPTED" && current.assignedCourierId === courier.id) return current;
      const assigned = await tx.deliveryOrder.updateMany({ where: { id, status: "PENDING_ASSIGNMENT", assignedCourierId: null }, data: { status: "ACCEPTED", assignedCourierId: courier.id, assignedById: access.user.id, assignedAt: new Date() } });
      if (assigned.count !== 1) throw new Error("ORDER_ALREADY_ASSIGNED");
      await tx.orderOffer.upsert({ where: { orderId_courierId: { orderId: id, courierId: courier.id } }, create: { orderId: id, courierId: courier.id, status: "ACCEPTED", respondedAt: new Date() }, update: { status: "ACCEPTED", respondedAt: new Date() } });
      await tx.orderStatusEvent.create({ data: { orderId: id, fromStatus: "PENDING_ASSIGNMENT", toStatus: "ACCEPTED", actorId: access.user.id, actorRole: access.user.role, comment: parsed.data.comment ?? `Asignado manualmente a ${courier.user.name}.` } });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "ORDER_ASSIGNED", entityType: "DeliveryOrder", entityId: id, metadata: { courierId: courier.id } } });
      return tx.deliveryOrder.findUniqueOrThrow({ where: { id }, select: { id: true, publicCode: true, status: true, assignedCourierId: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "COURIER_NOT_APPROVED") return apiError(422, "MOTORIZADO_NO_DISPONIBLE", "El motorizado no esta aprobado o tiene la cuenta bloqueada.");
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no existe.");
    if (error instanceof Error && error.message === "ORDER_ALREADY_ASSIGNED") return apiError(409, "PEDIDO_YA_ASIGNADO", "El pedido ya fue aceptado, asignado o cambio de estado.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otra persona asigno el pedido. Actualiza la lista.");
    throw error;
  }
}
