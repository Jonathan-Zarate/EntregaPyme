import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { findCompanyForUser } from "@/modules/companies/server/current-company";
import { topUpRequestSchema } from "@/modules/top-ups/domain/top-up-input";

export async function GET() {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de consultar recargas.");

  const topUps = await prisma.topUp.findMany({
    where: { companyId: company.id },
    orderBy: { requestedAt: "desc" },
    take: 30,
    select: { id: true, amount: true, status: true, operationCode: true, requestedAt: true, reviewedAt: true, reviewReason: true },
  });
  return NextResponse.json({ data: topUps.map((topUp) => ({ ...topUp, amount: topUp.amount.toFixed(2) })) });
}

export async function POST(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const company = await findCompanyForUser(access.user.id);
  if (!company) return apiError(409, "NEGOCIO_REQUERIDO", "Registra tu negocio antes de solicitar una recarga.");

  const parsed = topUpRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "DATOS_INVALIDOS", "Revisa los datos de la recarga.", parsed.error.flatten());

  const duplicated = await prisma.topUp.findFirst({
    where: { companyId: company.id, operationCode: parsed.data.operationCode, status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true },
  });
  if (duplicated) return apiError(409, "OPERACION_DUPLICADA", "Ya registraste una recarga con ese codigo de operacion.");

  try {
    const topUp = await prisma.topUp.create({
      data: { companyId: company.id, ...parsed.data },
      select: { id: true, amount: true, status: true, operationCode: true, requestedAt: true },
    });
    return NextResponse.json({ data: { ...topUp, amount: topUp.amount.toFixed(2) } }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(409, "OPERACION_DUPLICADA", "Ya registraste una recarga con ese codigo de operacion.");
    }
    throw error;
  }
}
