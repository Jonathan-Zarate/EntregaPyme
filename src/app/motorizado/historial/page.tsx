import { Suspense } from "react";

import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";

async function CourierHistory() {
  const user = await requireRole("COURIER");
  const courier = await findApprovedCourier(prisma, user.id);
  if (!courier) return <main className="p-8">Tu perfil debe estar aprobado.</main>;
  const [orders, earnings] = await Promise.all([
    prisma.deliveryOrder.findMany({ where: { assignedCourierId: courier.id, status: { in: ["DELIVERED", "CANCELLED"] } }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, publicCode: true, status: true, courierPayment: true, deliveredAt: true, cancelledAt: true, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } } } }),
    prisma.deliveryOrder.aggregate({ where: { assignedCourierId: courier.id, status: "DELIVERED" }, _sum: { courierPayment: true }, _count: { id: true } }),
  ]);
  return <main className="mx-auto w-full max-w-5xl px-5 py-10"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Historial y ganancias</h1><div className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Entregas completadas</p><p className="mt-1 text-2xl font-bold">{earnings._count.id}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Ganancia acumulada</p><p className="mt-1 text-2xl font-bold text-emerald-700">S/ {earnings._sum.courierPayment?.toFixed(2) ?? "0.00"}</p></article></div><section className="mt-6 overflow-x-auto rounded-2xl border bg-white p-5"><table className="w-full min-w-3xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Pedido</th><th>Trayecto</th><th>Estado</th><th>Fecha</th><th>Ganancia</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t"><td className="py-4 font-semibold">{order.publicCode}</td><td>{order.pickupDistrict.name} → {order.deliveryDistrict.name}</td><td>{order.status}</td><td>{(order.deliveredAt ?? order.cancelledAt)?.toLocaleString("es-PE") ?? "—"}</td><td className={order.status === "DELIVERED" ? "font-semibold text-emerald-700" : "text-slate-400"}>{order.status === "DELIVERED" ? `S/ ${order.courierPayment.toFixed(2)}` : "S/ 0.00"}</td></tr>)}</tbody></table>{orders.length === 0 && <p className="py-6 text-sm text-slate-500">Todavia no tienes servicios finalizados.</p>}</section></main>;
}

export default function CourierHistoryPage() {
  return <Suspense fallback={<p className="p-8">Cargando historial...</p>}><CourierHistory /></Suspense>;
}
