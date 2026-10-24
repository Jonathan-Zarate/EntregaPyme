import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";
import { quoteInputSchema } from "@/modules/orders/domain/order-input";
import { findActiveRate } from "@/modules/orders/server/active-rate";

export async function POST(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  if (!(await findCompanyForUser(access.user.id))) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de cotizar.");

  const parsed = quoteInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "DATOS_INVALIDOS", "Selecciona distritos validos.", parsed.error.flatten());

  const rate = await findActiveRate(prisma, parsed.data.pickupDistrictId, parsed.data.deliveryDistrictId);
  if (!rate) return apiError(404, "TARIFA_NO_DISPONIBLE", "Aun no existe una tarifa para esta ruta.");

  return NextResponse.json({
    data: {
      rateId: rate.id,
      origin: rate.originDistrict,
      destination: rate.destinationDistrict,
      price: rate.companyPrice.toFixed(2),
      currency: "PEN",
    },
  });
}
