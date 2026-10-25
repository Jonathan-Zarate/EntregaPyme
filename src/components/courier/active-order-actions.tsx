"use client";

import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

const nextAction: Record<string, { status: string; label: string }> = {
  ACCEPTED: { status: "HEADING_TO_PICKUP", label: "Salir al punto de recojo" },
  HEADING_TO_PICKUP: { status: "PICKED_UP", label: "Confirmar recojo" },
  PICKED_UP: {
    status: "HEADING_TO_DESTINATION",
    label: "Salir hacia el destino",
  },
  HEADING_TO_DESTINATION: { status: "DELIVERED", label: "Finalizar entrega" },
};

export function ActiveOrderActions({
  orderId,
  status,
  evidenceCount,
}: {
  orderId: string;
  status: string;
  evidenceCount: number;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const action = nextAction[status];

  async function addEvidence() {
    if (!comment.trim()) return;
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/orders/${orderId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "COMMENT", comment }),
    });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage(body?.error?.message ?? "No pudimos guardar la evidencia.");
      return;
    }
    setComment("");
    setMessage("Evidencia registrada.");
    router.refresh();
  }

  async function advance() {
    if (!action) return;
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ toStatus: action.status }),
    });
    const body = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage(body?.error?.message ?? "No pudimos actualizar el pedido.");
      return;
    }
    router.refresh();
  }

  async function addPhoto() {
    const file = photoRef.current?.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("La fotografia no puede superar 5 MB.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const blob = await upload(
        `delivery-evidence/${orderId}/${file.name}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/orders/evidence-upload",
          clientPayload: JSON.stringify({ orderId }),
        },
      );
      const response = await fetch(`/api/orders/${orderId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PHOTO", url: blob.url }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          body?.error?.message ?? "No pudimos vincular la fotografia.",
        );
      if (photoRef.current) photoRef.current.value = "";
      setMessage("Fotografia registrada.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No pudimos cargar la fotografia.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      <div className="flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          placeholder="Evidencia: nombre de quien recibio..."
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addEvidence}
          disabled={pending || !comment.trim()}
          className="rounded-xl border border-blue-700 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="min-w-0 flex-1 text-xs"
        />
        <button
          type="button"
          onClick={addPhoto}
          disabled={pending}
          className="rounded-xl border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50"
        >
          Subir foto
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Evidencias: {evidenceCount}</p>
        {action && (
          <button
            type="button"
            onClick={advance}
            disabled={
              pending || (action.status === "DELIVERED" && evidenceCount === 0)
            }
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Procesando..." : action.label}
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="text-xs font-medium text-blue-700">
          {message}
        </p>
      )}
    </div>
  );
}
