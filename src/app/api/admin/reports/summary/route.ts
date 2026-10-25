import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { reportQuerySchema, reportRange } from "@/modules/reports/domain/report-input";

export async function GET(request: Request) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = reportQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError(422, "RANGO_INVALIDO", "Revisa el rango de fechas.", parsed.error.flatten());
  const range = reportRange(parsed.data);
  const [statuses, delivered, topUps, companies, couriers] = await Promise.all([
    prisma.deliveryOrder.groupBy({ by: ["status"], where: { createdAt: range }, _count: { _all: true } }),
    prisma.deliveryOrder.aggregate({ where: { status: "DELIVERED", deliveredAt: range }, _count: { _all: true }, _sum: { companyPrice: true, courierPayment: true, platformMargin: true } }),
    prisma.topUp.aggregate({ where: { status: "APPROVED", reviewedAt: range }, _count: { _all: true }, _sum: { amount: true } }),
    prisma.company.count({ where: { active: true } }),
    prisma.courierProfile.count({ where: { approvalStatus: "APPROVED" } }),
  ]);
  return NextResponse.json({ data: { range: parsed.data, ordersByStatus: Object.fromEntries(statuses.map((row) => [row.status, row._count._all])), delivered: { count: delivered._count._all, revenue: delivered._sum.companyPrice?.toFixed(2) ?? "0.00", courierPayments: delivered._sum.courierPayment?.toFixed(2) ?? "0.00", grossMargin: delivered._sum.platformMargin?.toFixed(2) ?? "0.00" }, approvedTopUps: { count: topUps._count._all, amount: topUps._sum.amount?.toFixed(2) ?? "0.00" }, activeCompanies: companies, approvedCouriers: couriers } });
}
