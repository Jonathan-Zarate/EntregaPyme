import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-authorization";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";
import {
  PHOTO_CONTENT_TYPES,
  PHOTO_MAX_BYTES,
} from "@/modules/orders/domain/photo-evidence";

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as HandleUploadBody | null;
  if (!body)
    return apiError(400, "CARGA_INVALIDA", "No se recibieron datos de carga.");
  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const access = await authorizeApi("COURIER");
        if ("error" in access) throw new Error("SIN_PERMISO");
        const courier = await findApprovedCourier(prisma, access.user.id);
        if (!courier) throw new Error("MOTORIZADO_NO_APROBADO");
        const orderId = JSON.parse(clientPayload ?? "{}").orderId as
          | string
          | undefined;
        if (!orderId || !pathname.startsWith(`delivery-evidence/${orderId}/`))
          throw new Error("RUTA_INVALIDA");
        const order = await prisma.deliveryOrder.findFirst({
          where: {
            id: orderId,
            assignedCourierId: courier.id,
            status: {
              in: [
                "ACCEPTED",
                "HEADING_TO_PICKUP",
                "PICKED_UP",
                "HEADING_TO_DESTINATION",
              ],
            },
          },
          select: { id: true },
        });
        if (!order) throw new Error("PEDIDO_NO_DISPONIBLE");
        return {
          allowedContentTypes: [...PHOTO_CONTENT_TYPES],
          maximumSizeInBytes: PHOTO_MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ orderId, userId: access.user.id }),
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  } catch (error) {
    return apiError(
      400,
      "CARGA_RECHAZADA",
      error instanceof Error
        ? error.message
        : "No se pudo autorizar la fotografia.",
    );
  }
}
