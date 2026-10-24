import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { canAccessRole, type AppRole } from "@/modules/auth/domain/access-policy";

export async function authorizeApi(...roles: AppRole[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) {
    return { error: apiError(401, "NO_AUTENTICADO", "Debes iniciar sesion.") } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true, banned: true },
  });

  if (!user || !canAccessRole(user, roles)) {
    return { error: apiError(403, "SIN_PERMISO", "No tienes permiso para realizar esta accion.") } as const;
  }

  return { user } as const;
}
