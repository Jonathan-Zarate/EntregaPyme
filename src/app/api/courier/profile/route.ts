import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { courierProfileInputSchema } from "@/modules/couriers/domain/courier-profile";

const profileSelect = { id: true, documentType: true, documentNumber: true, phone: true, vehiclePlate: true, approvalStatus: true, reviewReason: true, createdAt: true } satisfies Prisma.CourierProfileSelect;

export async function GET() {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const profile = await prisma.courierProfile.findUnique({ where: { userId: access.user.id }, select: profileSelect });
  return NextResponse.json({ data: profile });
}

export async function POST(request: Request) {
  const access = await authorizeApi("COMPANY");
  if ("error" in access) return access.error;
  const parsed = courierProfileInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "DATOS_INVALIDOS", "Revisa tus datos personales y del vehiculo.", parsed.error.flatten());

  try {
    const profile = await prisma.$transaction(async (tx) => {
      const [membership, existingProfile] = await Promise.all([
        tx.companyMember.findFirst({ where: { userId: access.user.id }, select: { id: true } }),
        tx.courierProfile.findUnique({ where: { userId: access.user.id }, select: { id: true } }),
      ]);
      if (membership) throw new Error("COMPANY_ACCOUNT_IN_USE");
      if (existingProfile) throw new Error("PROFILE_ALREADY_EXISTS");
      const created = await tx.courierProfile.create({ data: { userId: access.user.id, ...parsed.data, vehiclePlate: parsed.data.vehiclePlate || null }, select: profileSelect });
      await tx.user.update({ where: { id: access.user.id }, data: { role: "COURIER" } });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "COURIER_PROFILE_CREATED", entityType: "CourierProfile", entityId: created.id } });
      return created;
    });
    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "COMPANY_ACCOUNT_IN_USE") return apiError(409, "CUENTA_EMPRESA_EN_USO", "Una cuenta vinculada a un negocio no puede convertirse en motorizado.");
    if (error instanceof Error && error.message === "PROFILE_ALREADY_EXISTS") return apiError(409, "PERFIL_YA_REGISTRADO", "Ya existe un perfil de motorizado para esta cuenta.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "DOCUMENTO_DUPLICADO", "El documento ya pertenece a otro motorizado.");
    throw error;
  }
}

export async function PATCH(request: Request) {
  const access = await authorizeApi("COURIER");
  if ("error" in access) return access.error;
  const parsed = courierProfileInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "DATOS_INVALIDOS", "Revisa tus datos personales y del vehiculo.", parsed.error.flatten());
  try {
    const profile = await prisma.courierProfile.update({ where: { userId: access.user.id }, data: { ...parsed.data, vehiclePlate: parsed.data.vehiclePlate || null, approvalStatus: "PENDING", reviewedAt: null, reviewedById: null, reviewReason: null }, select: profileSelect });
    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return apiError(404, "PERFIL_NO_ENCONTRADO", "El perfil de motorizado no existe.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(409, "DOCUMENTO_DUPLICADO", "El documento ya pertenece a otro motorizado.");
    throw error;
  }
}
