"use client";
import { orderWhatsAppUrl, type OrderNotification } from "@/modules/notifications/domain/whatsapp";

export function WhatsAppOrderLink({ order }: { order: OrderNotification }) {
  const url = orderWhatsAppUrl(order);
  if (!url) return <span className="text-xs text-amber-700">Telefono no compatible</span>;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Enviar por WhatsApp</a>;
}
