import { Suspense } from "react";
import { requireRole } from "@/lib/authorization";

async function CourierContent() {
  const user = await requireRole("COURIER");
  return <main className="mx-auto w-full max-w-6xl px-5 py-12"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Panel de motorizado</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Aqui verás servicios disponibles, activos y ganancias.</p></main>;
}

export default function CourierPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><CourierContent /></Suspense>;
}
