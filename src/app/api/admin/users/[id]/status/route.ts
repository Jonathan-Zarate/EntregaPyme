import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ status: z.enum(["ACTIVE", "BLOCKED"]), reason: z.string().trim().min(5).max(300).optional() });

export async function PATCH(request: Request, context: RouteContext<"/api/admin/users/[id]/status">) {
  const actor = await requireRole("ADMIN");
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: { code: "DATOS_INVALIDOS", message: "Revisa el estado y el motivo." } }, { status: 400 });
  if (id === actor.id && parsed.data.status === "BLOCKED") return NextResponse.json({ error: { code: "AUTO_BLOQUEO_NO_PERMITIDO", message: "No puedes bloquear tu propia cuenta." } }, { status: 409 });

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: { status: parsed.data.status, banned: parsed.data.status === "BLOCKED", banReason: parsed.data.status === "BLOCKED" ? parsed.data.reason : null }, select: { id: true, name: true, email: true, role: true, status: true } });
    if (parsed.data.status === "BLOCKED") await tx.session.deleteMany({ where: { userId: id } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: parsed.data.status === "BLOCKED" ? "USER_BLOCKED" : "USER_ACTIVATED", entityType: "User", entityId: id, metadata: { reason: parsed.data.reason ?? null } } });
    return user;
  });
  return NextResponse.json({ data: result });
}
