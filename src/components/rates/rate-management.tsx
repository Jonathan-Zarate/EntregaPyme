"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type District = { id: string; name: string };
type Rate = { id: string; companyPrice: string; courierPayment: string; platformMargin: string; originDistrict: District; destinationDistrict: District; _count: { orders: number } };

export function RateManagement({ districts, rates }: { districts: District[]; rates: Rate[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const inputClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  async function create(formData: FormData) {
    setPending(true); setMessage("");
    const response = await fetch("/api/admin/rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos crear la tarifa."); return; }
    setMessage("Tarifa creada."); router.refresh();
  }

  async function update(rateId: string, formData: FormData) {
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/rates/${rateId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos actualizar la tarifa."); return; }
    setMessage("Nueva version de tarifa creada."); router.refresh();
  }

  async function deactivate(rateId: string) {
    if (!window.confirm("¿Desactivar esta ruta? Las cotizaciones nuevas dejaran de estar disponibles.")) return;
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/rates/${rateId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: false }) });
    const body = await response.json().catch(() => null); setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos desactivar la tarifa."); return; }
    setMessage("Tarifa desactivada."); router.refresh();
  }

  return <div className="mt-5 space-y-5">{message && <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<form action={create} className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-5"><select name="originDistrictId" required className={inputClass}><option value="">Origen</option>{districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select><select name="destinationDistrictId" required className={inputClass}><option value="">Destino</option>{districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select><input name="companyPrice" type="number" min="0.01" step="0.01" placeholder="Precio S/" required className={inputClass} /><input name="courierPayment" type="number" min="0.01" step="0.01" placeholder="Pago S/" required className={inputClass} /><button disabled={pending} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Crear tarifa</button></form><div className="max-h-96 overflow-auto"><table className="w-full min-w-4xl text-left text-sm"><thead className="sticky top-0 bg-white text-slate-500"><tr><th className="py-3">Ruta</th><th>Precio</th><th>Pago</th><th>Margen</th><th>Pedidos</th><th>Acciones</th></tr></thead><tbody>{rates.map((rate) => <tr key={rate.id} className="border-t border-slate-100"><td className="py-3 font-medium">{rate.originDistrict.name} → {rate.destinationDistrict.name}</td><td colSpan={3}><form action={(formData) => update(rate.id, formData)} className="flex items-center gap-2"><input name="companyPrice" type="number" min="0.01" step="0.01" defaultValue={rate.companyPrice} aria-label="Precio empresa" className="w-24 rounded-lg border border-slate-300 px-2 py-1" /><input name="courierPayment" type="number" min="0.01" step="0.01" defaultValue={rate.courierPayment} aria-label="Pago motorizado" className="w-24 rounded-lg border border-slate-300 px-2 py-1" /><span className="w-20 font-semibold text-emerald-700">S/ {rate.platformMargin}</span><button disabled={pending} className="text-xs font-semibold text-blue-700">Guardar</button></form></td><td>{rate._count.orders}</td><td><button type="button" onClick={() => deactivate(rate.id)} disabled={pending} className="text-xs font-semibold text-red-700">Desactivar</button></td></tr>)}</tbody></table></div></div>;
}
