"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CourierReviewActions({ courierId, status }: { courierId: string; status: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function approve() {
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/couriers/${courierId}/approve`, { method: "POST" });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos aprobar el perfil."); return; }
    router.refresh();
  }

  async function block() {
    setPending(true); setMessage("");
    const response = await fetch(`/api/admin/couriers/${courierId}/block`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos bloquear el perfil."); return; }
    setBlocking(false); setReason(""); router.refresh();
  }

  if (blocking) return <div className="min-w-64 space-y-2"><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo del bloqueo" maxLength={300} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex gap-2"><button type="button" onClick={block} disabled={pending || reason.trim().length < 5} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Confirmar</button><button type="button" onClick={() => setBlocking(false)} className="text-xs text-slate-600">Volver</button></div>{message && <p className="text-xs text-red-700">{message}</p>}</div>;

  return <div className="space-y-2"><div className="flex gap-2">{status !== "APPROVED" && <button type="button" onClick={approve} disabled={pending} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Aprobar</button>}{status !== "BLOCKED" && <button type="button" onClick={() => setBlocking(true)} disabled={pending} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Bloquear</button>}</div>{message && <p className="text-xs text-red-700">{message}</p>}</div>;
}
