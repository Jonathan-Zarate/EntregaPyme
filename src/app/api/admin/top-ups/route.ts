import { NextResponse } from "next/server";

import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const status = new URL(request.url).searchParams.get("status");

  const topUps = await prisma.topUp.findMany({
    where: status && ["PENDING", "APPROVED", "REJECTED"].includes(status) ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { requestedAt: "desc" },
    take: 100,
    select: {
      id: true, amount: true, status: true, operationCode: true, evidenceUrl: true, requestedAt: true, reviewedAt: true, reviewReason: true,
      company: { select: { id: true, ruc: true, legalName: true, tradeName: true } },
    },
  });
  return NextResponse.json({ data: topUps.map((topUp) => ({ ...topUp, amount: topUp.amount.toFixed(2) })) });
}
