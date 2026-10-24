import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";
import { paginationSchema } from "@/modules/shared/domain/pagination";

export async function GET(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  const walletId = company?.wallet?.id;
  if (!walletId) return apiError(409, "BILLETERA_REQUERIDA", "El negocio no tiene una billetera activa.");
  const parsed = paginationSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError(422, "PAGINACION_INVALIDA", "Revisa la pagina y el limite.");
  const { page, limit } = parsed.data;
  const [total, transactions] = await prisma.$transaction([
    prisma.walletTransaction.count({ where: { walletId } }),
    prisma.walletTransaction.findMany({ where: { walletId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, type: true, amount: true, availableAfter: true, reservedAfter: true, description: true, createdAt: true, order: { select: { publicCode: true } } } }),
  ]);
  return NextResponse.json({ data: transactions.map((item) => ({ ...item, amount: item.amount.toFixed(2), availableAfter: item.availableAfter.toFixed(2), reservedAfter: item.reservedAfter.toFixed(2) })), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
}
