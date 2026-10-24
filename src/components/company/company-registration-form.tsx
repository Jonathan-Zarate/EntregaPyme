"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type District = { id: string; name: string };

export function CompanyRegistrationForm({ districts }: { districts: District[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");

    const response = await fetch("/api/companies/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "No pudimos registrar el negocio.");
      return;
    }

    router.refresh();
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900";

  return (
    <form action={submit} className="grid gap-5 md:grid-cols-2">
      {error && <p role="alert" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <label className="text-sm font-semibold text-slate-700">RUC<input className={inputClass} name="ruc" inputMode="numeric" pattern="20[0-9]{9}" maxLength={11} required /></label>
      <label className="text-sm font-semibold text-slate-700">Razon social<input className={inputClass} name="legalName" minLength={3} required /></label>
      <label className="text-sm font-semibold text-slate-700">Nombre comercial (opcional)<input className={inputClass} name="tradeName" /></label>
      <label className="text-sm font-semibold text-slate-700">Telefono<input className={inputClass} name="phone" type="tel" required /></label>
      <label className="text-sm font-semibold text-slate-700">Distrito de recojo habitual<select className={inputClass} name="districtId" required defaultValue=""><option value="" disabled>Selecciona un distrito</option>{districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select></label>
      <label className="text-sm font-semibold text-slate-700">Direccion de recojo<input className={inputClass} name="pickupAddress" minLength={5} required /></label>
      <label className="md:col-span-2 text-sm font-semibold text-slate-700">Referencia (opcional)<input className={inputClass} name="pickupReference" /></label>
      <button disabled={pending || districts.length === 0} className="md:col-span-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Registrando..." : "Registrar negocio"}</button>
    </form>
  );
}
