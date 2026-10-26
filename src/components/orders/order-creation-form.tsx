"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type District = { id: string; name: string };
type Quote = { price: string; origin: District; destination: District };
type OrderDraft = Record<string, string>;

export function OrderCreationForm({
  districts,
  defaultPickupDistrictId,
  defaultPickupAddress,
}: {
  districts: District[];
  defaultPickupDistrictId: string;
  defaultPickupAddress: string;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900";

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const data = Object.fromEntries(
      Array.from(formData.entries(), ([key, value]) => [key, String(value)]),
    );
    if (!quote) {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      setPending(false);
      if (!response.ok) {
        setMessage(payload.error?.message ?? "No pudimos calcular la tarifa.");
        return;
      }
      setDraft(data);
      setQuote(payload.data);
      return;
    }

    if (!draft) {
      setPending(false);
      setQuote(null);
      setMessage("Vuelve a cotizar el pedido.");
      return;
    }
    const createdResponse = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const created = await createdResponse.json();
    if (!createdResponse.ok) {
      setPending(false);
      setMessage(created.error?.message ?? "No pudimos crear el pedido.");
      return;
    }

    const confirmedResponse = await fetch(
      `/api/orders/${created.data.id}/confirm`,
      { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } },
    );
    const confirmed = await confirmedResponse.json();
    setPending(false);
    if (!confirmedResponse.ok) {
      setMessage(
        `${confirmed.error?.message ?? "No pudimos confirmar el pedido."} El borrador ${created.data.publicCode} se conservo.`,
      );
      router.refresh();
      return;
    }
    setMessage(
      `Pedido ${confirmed.data.publicCode} confirmado y saldo reservado.`,
    );
    setQuote(null);
    setDraft(null);
    router.refresh();
  }

  function invalidateQuote() {
    if (quote) {
      setQuote(null);
      setDraft(null);
    }
  }

  return (
    <form
      action={submit}
      onChange={invalidateQuote}
      className="grid gap-4 md:grid-cols-2"
    >
      {message && (
        <p
          role="status"
          className="md:col-span-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
        >
          {message}
        </p>
      )}
      <label className="text-sm font-semibold text-slate-700">
        Distrito de recojo
        <select
          className={inputClass}
          name="pickupDistrictId"
          defaultValue={defaultPickupDistrictId}
          required
        >
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Direccion de recojo
        <input
          className={inputClass}
          name="pickupAddress"
          defaultValue={defaultPickupAddress}
          minLength={5}
          required
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Referencia de recojo
        <input className={inputClass} name="pickupReference" />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Distrito de entrega
        <select
          className={inputClass}
          name="deliveryDistrictId"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Selecciona un distrito
          </option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Direccion de entrega
        <input
          className={inputClass}
          name="deliveryAddress"
          minLength={5}
          required
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Referencia de entrega
        <input className={inputClass} name="deliveryReference" />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Nombre del cliente
        <input
          className={inputClass}
          name="recipientName"
          minLength={3}
          required
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Telefono del cliente
        <input
          className={inputClass}
          name="recipientPhone"
          type="tel"
          required
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Tipo de paquete
        <select className={inputClass} name="packageType" defaultValue="SMALL">
          <option value="DOCUMENT">Documento</option>
          <option value="SMALL">Paquete pequeno</option>
          <option value="MEDIUM">Paquete mediano</option>
          <option value="LARGE">Paquete grande</option>
          <option value="OTHER">Otro</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Descripcion
        <input className={inputClass} name="packageDescription" />
      </label>
      <label className="md:col-span-2 text-sm font-semibold text-slate-700">
        Observaciones
        <textarea className={inputClass} name="observations" rows={2} />
      </label>
      {quote && (
        <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div>
            <p className="text-sm text-emerald-800">
              Tarifa fija · {quote.origin.name} → {quote.destination.name}
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              S/ {quote.price}
            </p>
          </div>
          <p className="text-xs text-emerald-800">Se reservara de tu saldo</p>
        </div>
      )}
      <button
        disabled={pending}
        className="md:col-span-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending
          ? "Procesando..."
          : quote
            ? "Confirmar pedido"
            : "Cotizar delivery"}
      </button>
    </form>
  );
}
