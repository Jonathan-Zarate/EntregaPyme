"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopUpRequestForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setPending(true); setMessage("");
    const response = await fetch("/api/top-ups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const payload = await response.json(); setPending(false);
    if (!response.ok) { setMessage(payload.error?.message ?? "No pudimos registrar la recarga."); return; }
    setMessage("Recarga enviada para revision administrativa."); router.refresh();
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal";
  return <form action={submit} className="grid gap-4 md:grid-cols-3">{message && <p role="status" className="md:col-span-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<label className="text-sm font-semibold text-slate-700">Monto (S/)<input className={inputClass} name="amount" type="number" min="10" max="10000" step="0.01" required /></label><label className="text-sm font-semibold text-slate-700">Codigo de operacion<input className={inputClass} name="operationCode" minLength={4} required /></label><label className="text-sm font-semibold text-slate-700">URL de evidencia (opcional)<input className={inputClass} name="evidenceUrl" type="url" /></label><button disabled={pending} className="md:col-span-3 rounded-xl border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">{pending ? "Enviando..." : "Solicitar recarga"}</button></form>;
}
