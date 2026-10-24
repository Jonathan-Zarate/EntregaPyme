import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";

export async function GET() {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de consultar la billetera.");
  const wallet = await prisma.wallet.findUnique({ where: { companyId: company.id }, select: { id: true, availableBalance: true, reservedBalance: true, updatedAt: true } });
  if (!wallet) return apiError(404, "BILLETERA_NO_ENCONTRADA", "La billetera del negocio no existe.");
  return NextResponse.json({ data: { ...wallet, availableBalance: wallet.availableBalance.toFixed(2), reservedBalance: wallet.reservedBalance.toFixed(2) } });
}
