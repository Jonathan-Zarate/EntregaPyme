"use client";

import { useState } from "react";

type Courier = { id: string; user: { name: string } };
type Order = { id: string; publicCode: string; status: string; companyPrice: string; recipientName: string; company: { legalName: string; tradeName: string | null }; pickupDistrict: { name: string }; deliveryDistrict: { name: string }; assignedCourier: { id: string; user: { name: string } } | null };
type Detail = Order & { pickupAddress: string; deliveryAddress: string; recipientPhone: string; packageType: string; packageDescription: string | null; statusEvents: { id: string; toStatus: string; actorRole: string; comment: string | null; createdAt: string; actor: { name: string } }[]; evidence: { id: string; type: string; comment: string | null; createdAt: string }[] };

export function AdminOrderManagement({ initialOrders, initialTotal, couriers }: { initialOrders: Order[]; initialTotal: number; couriers: Courier[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(Math.max(1, Math.ceil(initialTotal / 20)));
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function load(targetPage = 1) {
    setPending(true); setMessage("");
    const query = new URLSearchParams({ page: String(targetPage), limit: "20", ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
    const response = await fetch(`/api/admin/orders?${query}`);
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos consultar los pedidos."); return; }
    setOrders(body.data); setTotal(body.meta.total); setPage(body.meta.page); setPages(body.meta.pages);
  }

  async function openDetail(id: string) {
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/orders/${id}`);
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos abrir el pedido."); return; }
    setDetail(body.data);
  }

  async function assign(orderId: string, courierId: string) {
    if (!courierId) return;
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/orders/${orderId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courierId }) });
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos asignar el pedido."); return; }
    setMessage(`Pedido ${body.data.publicCode} asignado.`); await load(page);
  }

  return <div className="mt-5 space-y-4">{message && <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<div className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Codigo, cliente o empresa" className="rounded-xl border border-slate-300 px-4 py-2 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm"><option value="">Todos los estados</option>{["DRAFT", "PENDING_ASSIGNMENT", "ACCEPTED", "HEADING_TO_PICKUP", "PICKED_UP", "HEADING_TO_DESTINATION", "DELIVERED", "CANCELLED"].map((value) => <option key={value} value={value}>{value}</option>)}</select><button type="button" onClick={() => load(1)} disabled={pending} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Filtrar</button></div><div className="overflow-x-auto"><table className="w-full min-w-5xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Pedido</th><th>Empresa</th><th>Trayecto</th><th>Importe</th><th>Estado</th><th>Asignacion</th><th>Detalle</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-slate-100 align-top"><td className="py-4 font-semibold">{order.publicCode}</td><td>{order.company.tradeName ?? order.company.legalName}</td><td>{order.pickupDistrict.name} → {order.deliveryDistrict.name}</td><td>S/ {order.companyPrice}</td><td>{order.status}</td><td>{order.status === "PENDING_ASSIGNMENT" ? <select defaultValue="" onChange={(event) => assign(order.id, event.target.value)} disabled={pending} className="rounded-lg border border-slate-300 px-2 py-1"><option value="">Asignar...</option>{couriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.user.name}</option>)}</select> : order.assignedCourier?.user.name ?? "—"}</td><td><button type="button" onClick={() => openDetail(order.id)} className="font-semibold text-blue-700">Ver</button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between text-sm text-slate-600"><span>{total} pedidos · pagina {page} de {pages}</span><div className="flex gap-2"><button type="button" onClick={() => load(page - 1)} disabled={pending || page <= 1} className="rounded-lg border px-3 py-1 disabled:opacity-40">Anterior</button><button type="button" onClick={() => load(page + 1)} disabled={pending || page >= pages} className="rounded-lg border px-3 py-1 disabled:opacity-40">Siguiente</button></div></div>{detail && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><article className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-blue-700">{detail.publicCode}</p><h3 className="mt-1 text-2xl font-bold">{detail.pickupDistrict.name} → {detail.deliveryDistrict.name}</h3><p className="mt-1 text-slate-600">{detail.status} · S/ {detail.companyPrice}</p></div><button type="button" onClick={() => setDetail(null)} className="text-xl text-slate-500">×</button></div><div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2"><div><p className="text-xs font-bold text-slate-500">RECOJO</p><p>{detail.pickupAddress}</p></div><div><p className="text-xs font-bold text-slate-500">ENTREGA</p><p>{detail.deliveryAddress}</p></div><div><p className="text-xs font-bold text-slate-500">DESTINATARIO</p><p>{detail.recipientName} · {detail.recipientPhone}</p></div><div><p className="text-xs font-bold text-slate-500">PAQUETE</p><p>{detail.packageType} · {detail.packageDescription ?? "Sin descripcion"}</p></div></div><h4 className="mt-6 font-bold">Linea de tiempo</h4><ol className="mt-3 space-y-3 border-l-2 border-blue-200 pl-5">{detail.statusEvents.map((event) => <li key={event.id}><p className="font-semibold">{event.toStatus}</p><p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString("es-PE")} · {event.actor.name} ({event.actorRole})</p>{event.comment && <p className="mt-1 text-sm text-slate-600">{event.comment}</p>}</li>)}</ol><p className="mt-5 text-sm text-slate-600">Evidencias registradas: {detail.evidence.length}</p></article></div>}</div>;
}
