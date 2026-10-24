"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopUpReviewActions({ topUpId }: { topUpId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function review(action: "approve" | "reject") {
    const reason = action === "reject" ? window.prompt("Motivo del rechazo:")?.trim() : null;
    if (action === "reject" && !reason) return;
    setPending(true); setError("");
    const response = await fetch(`/api/admin/top-ups/${topUpId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(action === "approve" ? { "Idempotency-Key": crypto.randomUUID() } : {}) },
      body: JSON.stringify(action === "reject" ? { reason } : {}),
    });
    const payload = await response.json(); setPending(false);
    if (!response.ok) { setError(payload.error?.message ?? "No pudimos revisar la recarga."); return; }
    router.refresh();
  }

  return <div><div className="flex gap-2"><button disabled={pending} onClick={() => review("approve")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Aprobar</button><button disabled={pending} onClick={() => review("reject")} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">Rechazar</button></div>{error && <p className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
