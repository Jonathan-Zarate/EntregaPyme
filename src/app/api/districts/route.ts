import { NextResponse } from "next/server";

import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await authorizeApi("COMPANY", "ADMIN");
  if ("error" in access) return access.error;
  const districts = await prisma.district.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, ubigeo: true, name: true, province: true, department: true },
  });
  return NextResponse.json({ data: districts });
}
