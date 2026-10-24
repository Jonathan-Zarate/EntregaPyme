import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const { id } = await context.params;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const courier = await findApprovedCourier(tx, access.user.id);
      if (!courier) throw new Error("COURIER_NOT_APPROVED");

      const current = await tx.deliveryOrder.findUnique({
        where: { id },
        select: { id: true, publicCode: true, status: true, assignedCourierId: true, courierPayment: true },
      });
      if (!current) throw new Error("ORDER_NOT_FOUND");
      if (current.status === "ACCEPTED" && current.assignedCourierId === courier.id) return current;

      const accepted = await tx.deliveryOrder.updateMany({
        where: { id, status: "PENDING_ASSIGNMENT", assignedCourierId: null },
        data: { status: "ACCEPTED", assignedCourierId: courier.id, assignedAt: new Date() },
      });
      if (accepted.count !== 1) throw new Error("ORDER_ALREADY_ASSIGNED");

      await tx.orderOffer.upsert({
        where: { orderId_courierId: { orderId: id, courierId: courier.id } },
        create: { orderId: id, courierId: courier.id, status: "ACCEPTED", respondedAt: new Date() },
        update: { status: "ACCEPTED", respondedAt: new Date() },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          fromStatus: "PENDING_ASSIGNMENT",
          toStatus: "ACCEPTED",
          actorId: access.user.id,
          actorRole: access.user.role,
          comment: "Pedido aceptado por el motorizado.",
        },
      });

      return tx.deliveryOrder.findUniqueOrThrow({
        where: { id },
        select: { id: true, publicCode: true, status: true, assignedCourierId: true, courierPayment: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ data: { ...order, courierPayment: order.courierPayment.toFixed(2) } });
  } catch (error) {
    if (error instanceof Error && error.message === "COURIER_NOT_APPROVED") return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado para aceptar servicios.");
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return apiError(404, "PEDIDO_NO_ENCONTRADO", "El pedido no existe.");
    if (error instanceof Error && error.message === "ORDER_ALREADY_ASSIGNED") return apiError(409, "PEDIDO_YA_ASIGNADO", "Otro motorizado ya acepto este pedido.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return apiError(409, "CONCURRENCIA_DETECTADA", "Otro motorizado intento aceptar el pedido. Actualiza la lista.");
    throw error;
  }
}
