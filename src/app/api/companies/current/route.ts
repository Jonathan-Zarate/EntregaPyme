import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { companyInputSchema } from "@/modules/companies/domain/company-input";

const companySelect = {
  id: true,
  ruc: true,
  legalName: true,
  tradeName: true,
  phone: true,
  pickupAddress: true,
  pickupReference: true,
  districtId: true,
  district: { select: { id: true, name: true } },
  wallet: { select: { availableBalance: true, reservedBalance: true } },
} satisfies Prisma.CompanySelect;

export async function GET() {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;

  const membership = await prisma.companyMember.findFirst({
    where: { userId: access.user.id },
    select: { role: true, company: { select: companySelect } },
  });

  return NextResponse.json({ data: membership ?? null });
}

export async function POST(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;

  const parsed = companyInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(422, "DATOS_INVALIDOS", "Revisa los datos del negocio.", parsed.error.flatten());
  }

  try {
    const company = await prisma.$transaction(async (tx) => {
      const existingMembership = await tx.companyMember.findFirst({ where: { userId: access.user.id } });
      if (existingMembership) throw new Error("USER_ALREADY_HAS_COMPANY");

      const district = await tx.district.findFirst({ where: { id: parsed.data.districtId, active: true } });
      if (!district) throw new Error("DISTRICT_NOT_FOUND");

      return tx.company.create({
        data: {
          ...parsed.data,
          members: { create: { userId: access.user.id, role: "OWNER" } },
          wallet: { create: {} },
        },
        select: companySelect,
      });
    });

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_HAS_COMPANY") {
      return apiError(409, "NEGOCIO_YA_REGISTRADO", "Tu usuario ya pertenece a un negocio.");
    }
    if (error instanceof Error && error.message === "DISTRICT_NOT_FOUND") {
      return apiError(422, "DISTRITO_INVALIDO", "El distrito seleccionado no esta disponible.");
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(409, "RUC_DUPLICADO", "Ya existe un negocio registrado con ese RUC.");
    }
    throw error;
  }
}
