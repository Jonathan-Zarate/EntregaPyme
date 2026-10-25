import Link from "next/link";
import { AdminReportSection } from "@/components/reports/admin-report-section";
import { requireRole } from "@/lib/authorization";

export const instant = false;

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  return <main className="mx-auto w-full max-w-6xl px-5 py-12"><Link href="/admin" className="text-sm font-semibold text-blue-700">← Volver al panel</Link><h1 className="mt-4 text-3xl font-bold">Reportes</h1><p className="mt-2 text-slate-600">Indicadores financieros y exportacion operativa.</p><AdminReportSection /></main>;
}
