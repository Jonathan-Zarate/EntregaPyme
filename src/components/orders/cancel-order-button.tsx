"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function cancel() {
    setPending(true); setMessage("");
    const response = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ reason }) });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) { setMessage(body?.error?.message ?? "No pudimos cancelar el pedido."); return; }
    setOpen(false); router.refresh();
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-red-700">Cancelar</button>;
  return <div className="min-w-64 space-y-2"><input value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} maxLength={300} placeholder="Motivo de cancelacion" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex gap-2"><button type="button" onClick={cancel} disabled={pending || reason.trim().length < 5} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{pending ? "Cancelando..." : "Confirmar"}</button><button type="button" onClick={() => setOpen(false)} className="px-2 text-xs text-slate-600">Volver</button></div>{message && <p role="status" className="text-xs text-red-700">{message}</p>}</div>;
}
