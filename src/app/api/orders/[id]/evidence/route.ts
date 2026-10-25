import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";
import { deliveryEvidenceInputSchema } from "@/modules/orders/domain/order-workflow";
import { isOrderBlobUrl } from "@/modules/orders/domain/photo-evidence";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const courier = await findApprovedCourier(prisma, access.user.id);
  if (!courier) return apiError(403, "MOTORIZADO_NO_APROBADO", "Tu perfil debe estar aprobado para registrar evidencias.");
  const parsed = deliveryEvidenceInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "EVIDENCIA_INVALIDA", "Revisa los datos de la evidencia.", parsed.error.flatten());
  const { id } = await context.params;

  const order = await prisma.deliveryOrder.findFirst({
    where: { id, assignedCourierId: courier.id, status: { in: ["ACCEPTED", "HEADING_TO_PICKUP", "PICKED_UP", "HEADING_TO_DESTINATION"] } },
    select: { id: true },
  });
  if (!order) return apiError(404, "PEDIDO_NO_DISPONIBLE", "El pedido no esta asignado a tu perfil o ya finalizo.");
  if (parsed.data.type === "PHOTO" && (!parsed.data.url || !isOrderBlobUrl(parsed.data.url, id))) return apiError(422, "FOTO_NO_AUTORIZADA", "La fotografia debe provenir del almacenamiento autorizado para este pedido.");

  const evidence = await prisma.deliveryEvidence.create({
    data: { orderId: id, courierId: courier.id, actorId: access.user.id, ...parsed.data },
    select: { id: true, type: true, url: true, comment: true, createdAt: true },
  });
  return NextResponse.json({ data: evidence }, { status: 201 });
}
