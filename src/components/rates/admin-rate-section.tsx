import { RateManagement } from "@/components/rates/rate-management";
import { prisma } from "@/lib/prisma";

export async function AdminRateSection() {
  const [districts, rates] = await Promise.all([
    prisma.district.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.deliveryRate.findMany({ where: { active: true }, orderBy: [{ originDistrict: { name: "asc" } }, { destinationDistrict: { name: "asc" } }], select: { id: true, companyPrice: true, courierPayment: true, originDistrict: { select: { id: true, name: true } }, destinationDistrict: { select: { id: true, name: true } }, _count: { select: { orders: true } } } }),
  ]);
  const serialized = rates.map((rate) => ({ ...rate, companyPrice: rate.companyPrice.toFixed(2), courierPayment: rate.courierPayment.toFixed(2), platformMargin: rate.companyPrice.minus(rate.courierPayment).toFixed(2) }));
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Matriz de tarifas</h2><p className="mt-1 text-sm text-slate-600">Los cambios crean una nueva version y preservan los pedidos historicos.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">{rates.length} activas</span></div><RateManagement districts={districts} rates={serialized} /></section>;
}
