import { Suspense } from "react";
import { AcceptOrderButton } from "@/components/courier/accept-order-button";
import { ActiveOrderActions } from "@/components/courier/active-order-actions";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { findApprovedCourier } from "@/modules/couriers/server/approved-courier";

async function CourierContent() {
  const user = await requireRole("COURIER");
  const courier = await findApprovedCourier(prisma, user.id);
  if (!courier) return <main className="mx-auto w-full max-w-3xl px-5 py-12"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Perfil en revision</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Un administrador debe aprobar tu perfil antes de que puedas aceptar servicios.</p></main>;

  const [availableOrders, activeOrders] = await Promise.all([
    prisma.deliveryOrder.findMany({
      where: { status: "PENDING_ASSIGNMENT", assignedCourierId: null },
      orderBy: { confirmedAt: "asc" },
      take: 30,
      include: { company: { select: { legalName: true, tradeName: true } }, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } } },
    }),
    prisma.deliveryOrder.findMany({
      where: { assignedCourierId: courier.id, status: { in: ["ACCEPTED", "HEADING_TO_PICKUP", "PICKED_UP", "HEADING_TO_DESTINATION"] } },
      orderBy: { assignedAt: "desc" },
      take: 10,
      include: { pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, _count: { select: { evidence: true } } },
    }),
  ]);

  return <main className="mx-auto w-full max-w-6xl px-5 py-10"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Panel de motorizado</h1><p className="mt-2 text-slate-600">Hola, {user.name}. Revisa el trayecto y el pago fijo antes de aceptar.</p><section className="mt-8"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Servicios disponibles</h2><p className="mt-1 text-sm text-slate-600">Solo un motorizado puede quedarse con cada pedido.</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{availableOrders.length}</span></div>{availableOrders.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No hay pedidos disponibles por el momento.</p> : <div className="mt-5 grid gap-4 lg:grid-cols-2">{availableOrders.map((order) => <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-wide text-blue-700">{order.publicCode}</p><h3 className="mt-1 font-bold">{order.pickupDistrict.name} → {order.deliveryDistrict.name}</h3><p className="mt-1 text-sm text-slate-500">{order.company.tradeName ?? order.company.legalName}</p></div><p className="shrink-0 text-lg font-bold text-emerald-700">S/ {order.courierPayment.toFixed(2)}</p></div><dl className="mt-4 space-y-3 text-sm"><div><dt className="font-semibold text-slate-700">Recojo</dt><dd className="text-slate-600">{order.pickupAddress}{order.pickupReference ? ` · ${order.pickupReference}` : ""}</dd></div><div><dt className="font-semibold text-slate-700">Entrega</dt><dd className="text-slate-600">{order.deliveryAddress}{order.deliveryReference ? ` · ${order.deliveryReference}` : ""}</dd></div><div><dt className="font-semibold text-slate-700">Paquete</dt><dd className="text-slate-600">{order.packageType}{order.packageDescription ? ` · ${order.packageDescription}` : ""}</dd></div></dl><div className="mt-5"><AcceptOrderButton orderId={order.id} /></div></article>)}</div>}</section><section className="mt-10"><h2 className="text-xl font-bold">Servicios activos</h2>{activeOrders.length === 0 ? <p className="mt-4 text-sm text-slate-500">Todavia no tienes servicios activos.</p> : <div className="mt-4 grid gap-4 lg:grid-cols-2">{activeOrders.map((order) => <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-blue-700">{order.publicCode}</p><h3 className="mt-1 font-bold">{order.pickupDistrict.name} → {order.deliveryDistrict.name}</h3><p className="mt-1 text-sm text-slate-500">{order.status}</p></div><p className="font-bold text-emerald-700">S/ {order.courierPayment.toFixed(2)}</p></div><ActiveOrderActions orderId={order.id} status={order.status} evidenceCount={order._count.evidence} /></article>)}</div>}</section></main>;
}

export default function CourierPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><CourierContent /></Suspense>;
}
