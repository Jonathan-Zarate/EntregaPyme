import { AdminOrderManagement } from "@/components/orders/admin-order-management";
import { prisma } from "@/lib/prisma";

export async function AdminOrderSection() {
  const [orders, total, couriers] = await Promise.all([
    prisma.deliveryOrder.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, publicCode: true, status: true, companyPrice: true, recipientName: true, company: { select: { legalName: true, tradeName: true } }, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } }, assignedCourier: { select: { id: true, user: { select: { name: true } } } } } }),
    prisma.deliveryOrder.count(),
    prisma.courierProfile.findMany({ where: { approvalStatus: "APPROVED", user: { status: "ACTIVE", banned: false } }, orderBy: { user: { name: "asc" } }, select: { id: true, user: { select: { name: true } } } }),
  ]);
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Pedidos</h2><p className="mt-1 text-sm text-slate-600">Consulta el historial y asigna manualmente los pendientes.</p></div><span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">{total}</span></div><AdminOrderManagement initialOrders={orders.map((order) => ({ ...order, companyPrice: order.companyPrice.toFixed(2) }))} initialTotal={total} couriers={couriers} /></section>;
}
