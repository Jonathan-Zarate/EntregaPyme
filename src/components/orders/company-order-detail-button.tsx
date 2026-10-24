"use client";

import { useState } from "react";

type Detail = { publicCode: string; status: string; companyPrice: string; pickupAddress: string; deliveryAddress: string; recipientName: string; recipientPhone: string; assignedCourier: { phone: string; vehiclePlate: string | null; user: { name: string } } | null; statusEvents: { id: string; toStatus: string; actorRole: string; comment: string | null; createdAt: string; actor: { name: string } }[]; evidence: { id: string; type: string; comment: string | null }[] };

export function CompanyOrderDetailButton({ orderId }: { orderId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  async function open() {
    const response = await fetch(`/api/orders/${orderId}`);
    const body = await response.json().catch(() => null);
    if (!response.ok) { setError(body?.error?.message ?? "No pudimos abrir el pedido."); return; }
    setDetail(body.data);
  }
  return <>{error ? <span className="text-xs text-red-700">{error}</span> : <button type="button" onClick={open} className="text-sm font-semibold text-blue-700">Ver detalle</button>}{detail && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><article className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6"><div className="flex justify-between"><div><p className="text-sm font-bold text-blue-700">{detail.publicCode}</p><h3 className="text-2xl font-bold">{detail.status}</h3><p className="text-slate-600">S/ {detail.companyPrice}</p></div><button type="button" onClick={() => setDetail(null)} className="text-2xl">×</button></div><div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2"><p><b>Recojo:</b> {detail.pickupAddress}</p><p><b>Entrega:</b> {detail.deliveryAddress}</p><p><b>Cliente:</b> {detail.recipientName}</p><p><b>Telefono:</b> {detail.recipientPhone}</p>{detail.assignedCourier && <p className="md:col-span-2"><b>Motorizado:</b> {detail.assignedCourier.user.name} · {detail.assignedCourier.phone} · {detail.assignedCourier.vehiclePlate ?? "Sin placa"}</p>}</div><h4 className="mt-6 font-bold">Seguimiento</h4><ol className="mt-3 space-y-3 border-l-2 border-blue-200 pl-5">{detail.statusEvents.map((event) => <li key={event.id}><p className="font-semibold">{event.toStatus}</p><p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString("es-PE")} · {event.actor.name}</p>{event.comment && <p className="text-sm text-slate-600">{event.comment}</p>}</li>)}</ol><p className="mt-5 text-sm">Evidencias: {detail.evidence.length}</p></article></div>}</>;
}
