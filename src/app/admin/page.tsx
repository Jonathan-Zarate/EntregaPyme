import { Suspense } from "react";
import { requireRole } from "@/lib/authorization";

async function AdminContent() {
  const user = await requireRole("ADMIN");
  return <main className="mx-auto w-full max-w-6xl px-5 py-12"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Panel administrativo</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Gestiona usuarios, motorizados, tarifas, recargas y pedidos.</p></main>;
}

export default function AdminPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><AdminContent /></Suspense>;
}
