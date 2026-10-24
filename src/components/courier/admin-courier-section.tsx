import { CourierReviewActions } from "@/components/courier/courier-review-actions";
import { prisma } from "@/lib/prisma";
import { AdminRateSection } from "@/components/rates/admin-rate-section";

export async function AdminCourierSection() {
  const couriers = await prisma.courierProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, documentType: true, documentNumber: true, phone: true, vehiclePlate: true, approvalStatus: true, reviewReason: true, user: { select: { name: true, email: true } }, _count: { select: { assignedOrders: true } } },
  });

  return <><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Motorizados</h2><p className="mt-1 text-sm text-slate-600">La aprobacion habilita servicios; el bloqueo cierra las sesiones activas.</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{couriers.length}</span></div>{couriers.length === 0 ? <p className="mt-6 text-sm text-slate-500">No hay perfiles registrados.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-5xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Motorizado</th><th>Documento</th><th>Contacto</th><th>Vehiculo</th><th>Servicios</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{couriers.map((courier) => <tr key={courier.id} className="border-t border-slate-100 align-top"><td className="py-4"><p className="font-semibold">{courier.user.name}</p><p className="text-xs text-slate-500">{courier.user.email}</p></td><td>{courier.documentType} {courier.documentNumber}</td><td>{courier.phone}</td><td>{courier.vehiclePlate ?? "—"}</td><td>{courier._count.assignedOrders}</td><td><p className="font-semibold">{courier.approvalStatus}</p>{courier.reviewReason && <p className="max-w-48 text-xs text-red-700">{courier.reviewReason}</p>}</td><td><CourierReviewActions courierId={courier.id} status={courier.approvalStatus} /></td></tr>)}</tbody></table></div>}</section><AdminRateSection /></>;
}
