import Link from "next/link";
import { Suspense } from "react";
import { WhatsAppOrderLink } from "@/components/notifications/whatsapp-order-link";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

async function NotificationContent() {
  const user = await requireRole("COMPANY");
  const membership = await prisma.companyMember.findFirst({ where: { userId: user.id }, select: { company: { select: { legalName: true, tradeName: true, orders: { where: { status: { not: "DRAFT" } }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, publicCode: true, status: true, recipientName: true, recipientPhone: true, updatedAt: true } } } } } });
  if (!membership) return <main className="p-8">Registra tu negocio para enviar notificaciones.</main>;
  const company = membership.company;
  return <main className="mx-auto w-full max-w-5xl px-5 py-10"><Link href="/empresa" className="text-sm font-semibold text-blue-700">← Volver al panel</Link><h1 className="mt-4 text-3xl font-bold">Notificaciones por WhatsApp</h1><p className="mt-2 text-slate-600">{company.tradeName ?? company.legalName} · abre un mensaje preparado y confirma el envio desde WhatsApp.</p><div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">EntregaPyme no envia mensajes automaticamente ni comparte enlaces publicos con datos del pedido.</div><section className="mt-6 overflow-x-auto rounded-2xl border bg-white p-5"><table className="w-full min-w-3xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Pedido</th><th>Destinatario</th><th>Estado</th><th>Actualizacion</th><th>Accion</th></tr></thead><tbody>{company.orders.map((order) => <tr key={order.id} className="border-t"><td className="py-4 font-semibold">{order.publicCode}</td><td>{order.recipientName}</td><td>{order.status}</td><td>{order.updatedAt.toLocaleString("es-PE")}</td><td><WhatsAppOrderLink order={order} /></td></tr>)}</tbody></table>{company.orders.length === 0 && <p className="py-6 text-sm text-slate-500">No hay pedidos confirmados.</p>}</section></main>;
}

export default function NotificationsPage() { return <Suspense fallback={<p className="p-8">Cargando notificaciones...</p>}><NotificationContent /></Suspense>; }
