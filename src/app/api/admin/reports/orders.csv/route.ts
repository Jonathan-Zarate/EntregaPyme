import { apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-authorization";
import { prisma } from "@/lib/prisma";
import { csvCell, reportQuerySchema, reportRange } from "@/modules/reports/domain/report-input";

export async function GET(request: Request) {
  const access = await authorizeApi("ADMIN");
  if ("error" in access) return access.error;
  const parsed = reportQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError(422, "RANGO_INVALIDO", "Revisa el rango de fechas.", parsed.error.flatten());
  const orders = await prisma.deliveryOrder.findMany({ where: { createdAt: reportRange(parsed.data) }, orderBy: { createdAt: "desc" }, take: 5000, select: { publicCode: true, status: true, createdAt: true, deliveredAt: true, companyPrice: true, courierPayment: true, platformMargin: true, recipientName: true, company: { select: { legalName: true, tradeName: true } }, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, assignedCourier: { select: { user: { select: { name: true } } } } } });
  const header = ["pedido", "fecha", "empresa", "origen", "destino", "destinatario", "estado", "precio_empresa", "pago_motorizado", "margen", "motorizado", "fecha_entrega"];
  const rows = orders.map((order) => [order.publicCode, order.createdAt.toISOString(), order.company.tradeName ?? order.company.legalName, order.pickupDistrict.name, order.deliveryDistrict.name, order.recipientName, order.status, order.companyPrice.toFixed(2), order.courierPayment.toFixed(2), order.platformMargin.toFixed(2), order.assignedCourier?.user.name ?? "", order.deliveredAt?.toISOString() ?? ""].map(csvCell).join(","));
  return new Response(`\uFEFF${header.join(",")}\r\n${rows.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
}
