"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function accept() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage(body?.error?.message ?? "No pudimos aceptar el pedido.");
      if (response.status === 409) router.refresh();
      return;
    }
    router.refresh();
  }

  return <div className="space-y-2"><button type="button" onClick={accept} disabled={pending} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Asignando..." : "Aceptar servicio"}</button>{message && <p role="status" className="text-xs font-medium text-red-700">{message}</p>}</div>;
}
