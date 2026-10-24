import { Suspense } from "react";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { TopUpReviewActions } from "@/components/top-ups/top-up-review-actions";

async function AdminContent() {
  const user = await requireRole("ADMIN");
  const pendingTopUps = await prisma.topUp.findMany({ where: { status: "PENDING" }, orderBy: { requestedAt: "asc" }, select: { id: true, amount: true, operationCode: true, requestedAt: true, company: { select: { legalName: true, tradeName: true, ruc: true } } } });
  return <main className="mx-auto w-full max-w-6xl px-5 py-12"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Panel administrativo</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Gestiona usuarios, motorizados, tarifas, recargas y pedidos.</p><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Recargas pendientes</h2><p className="mt-1 text-sm text-slate-600">La aprobacion acredita inmediatamente la billetera.</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">{pendingTopUps.length}</span></div>{pendingTopUps.length === 0 ? <p className="mt-6 text-sm text-slate-500">No hay recargas por revisar.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-3xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-2">Empresa</th><th>Operacion</th><th>Monto</th><th>Solicitud</th><th>Acciones</th></tr></thead><tbody>{pendingTopUps.map((topUp) => <tr key={topUp.id} className="border-t border-slate-100"><td className="py-4"><p className="font-semibold">{topUp.company.tradeName ?? topUp.company.legalName}</p><p className="text-xs text-slate-500">RUC {topUp.company.ruc}</p></td><td>{topUp.operationCode}</td><td className="font-semibold">S/ {Number(topUp.amount).toFixed(2)}</td><td>{topUp.requestedAt.toLocaleDateString("es-PE")}</td><td><TopUpReviewActions topUpId={topUp.id} /></td></tr>)}</tbody></table></div>}</section></main>;
}

export default function AdminPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><AdminContent /></Suspense>;
}
