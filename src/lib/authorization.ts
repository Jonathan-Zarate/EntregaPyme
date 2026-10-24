import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessRole, isActiveUser, type AppRole } from "@/modules/auth/domain/access-policy";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, emailVerified: true, role: true, status: true, banned: true },
  });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion");
  if (!isActiveUser(user)) redirect("/cuenta-bloqueada");
  if (process.env.EMAIL_VERIFICATION_REQUIRED === "true" && user.role !== "ADMIN" && !user.emailVerified) redirect(`/verificar-correo?email=${encodeURIComponent(user.email)}`);
  return user;
}

export async function requireRole(...allowedRoles: AppRole[]) {
  const user = await requireCurrentUser();
  if (!canAccessRole(user, allowedRoles)) redirect("/sin-acceso");
  return user;
}
