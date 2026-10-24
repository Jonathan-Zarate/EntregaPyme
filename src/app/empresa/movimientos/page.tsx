import { Suspense } from "react";

import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

async function WalletHistory() {
  const user = await requireRole("COMPANY");
  const membership = await prisma.companyMember.findFirst({ where: { userId: user.id }, select: { company: { select: { legalName: true, tradeName: true, wallet: { select: { availableBalance: true, reservedBalance: true, transactions: { orderBy: { createdAt: "desc" }, take: 50, select: { id: true, type: true, amount: true, availableAfter: true, reservedAfter: true, description: true, createdAt: true, order: { select: { publicCode: true } } } } } } } } } });
  const company = membership?.company;
  if (!company?.wallet) return <main className="p-8">Registra tu negocio para consultar movimientos.</main>;
  return <main className="mx-auto w-full max-w-5xl px-5 py-10"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Movimientos de billetera</h1><p className="mt-2 text-slate-600">{company.tradeName ?? company.legalName}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Disponible</p><p className="mt-1 text-2xl font-bold text-emerald-700">S/ {company.wallet.availableBalance.toFixed(2)}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Reservado</p><p className="mt-1 text-2xl font-bold">S/ {company.wallet.reservedBalance.toFixed(2)}</p></article></div><section className="mt-6 overflow-x-auto rounded-2xl border bg-white p-5"><table className="w-full min-w-3xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th><th>Disponible</th><th>Reservado</th></tr></thead><tbody>{company.wallet.transactions.map((item) => <tr key={item.id} className="border-t"><td className="py-4">{item.createdAt.toLocaleString("es-PE")}</td><td>{item.type}</td><td>{item.description ?? item.order?.publicCode ?? "—"}</td><td className="font-semibold">S/ {item.amount.toFixed(2)}</td><td>S/ {item.availableAfter.toFixed(2)}</td><td>S/ {item.reservedAfter.toFixed(2)}</td></tr>)}</tbody></table>{company.wallet.transactions.length === 0 && <p className="py-6 text-sm text-slate-500">No hay movimientos registrados.</p>}</section></main>;
}

export default function WalletHistoryPage() {
  return <Suspense fallback={<p className="p-8">Cargando movimientos...</p>}><WalletHistory /></Suspense>;
}
