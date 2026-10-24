import { Suspense } from "react";
import { requireRole } from "@/lib/authorization";

async function CompanyContent() {
  const user = await requireRole("COMPANY");
  return <main className="mx-auto w-full max-w-6xl px-5 py-12"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Panel de empresa</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Desde aqui configurarás tu negocio, saldo y pedidos.</p></main>;
}

export default function CompanyPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><CompanyContent /></Suspense>;
}
