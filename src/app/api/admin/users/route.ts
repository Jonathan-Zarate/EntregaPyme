import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole("ADMIN");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } });
  return NextResponse.json({ data: users });
}
