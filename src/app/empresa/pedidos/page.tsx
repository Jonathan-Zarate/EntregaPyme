import { Suspense } from "react";

import { CompanyOrderDetailButton } from "@/components/orders/company-order-detail-button";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

async function CompanyOrders() {
  const user = await requireRole("COMPANY");
  const membership = await prisma.companyMember.findFirst({ where: { userId: user.id }, select: { company: { select: { legalName: true, tradeName: true, orders: { orderBy: { createdAt: "desc" }, take: 50, select: { id: true, publicCode: true, status: true, companyPrice: true, recipientName: true, createdAt: true, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } } } } } } } });
  const company = membership?.company;
  if (!company) return <main className="p-8">Registra tu negocio para consultar pedidos.</main>;
  return <main className="mx-auto w-full max-w-6xl px-5 py-10"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Pedidos del negocio</h1><p className="mt-2 text-slate-600">{company.tradeName ?? company.legalName} · consulta responsables, evidencias y cada cambio de estado.</p><section className="mt-6 overflow-x-auto rounded-2xl border bg-white p-5"><table className="w-full min-w-4xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Pedido</th><th>Fecha</th><th>Trayecto</th><th>Destinatario</th><th>Importe</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{company.orders.map((order) => <tr key={order.id} className="border-t"><td className="py-4 font-semibold">{order.publicCode}</td><td>{order.createdAt.toLocaleDateString("es-PE")}</td><td>{order.pickupDistrict.name} → {order.deliveryDistrict.name}</td><td>{order.recipientName}</td><td>S/ {order.companyPrice.toFixed(2)}</td><td>{order.status}</td><td><CompanyOrderDetailButton orderId={order.id} /></td></tr>)}</tbody></table>{company.orders.length === 0 && <p className="py-6 text-sm text-slate-500">Aun no registraste pedidos.</p>}</section></main>;
}

export default function CompanyOrdersPage() {
  return <Suspense fallback={<p className="p-8">Cargando pedidos...</p>}><CompanyOrders /></Suspense>;
}
