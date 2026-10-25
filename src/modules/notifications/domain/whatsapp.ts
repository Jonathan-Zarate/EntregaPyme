export type OrderNotification = { publicCode: string; status: string; recipientName: string; recipientPhone: string };

const statusLabels: Record<string, string> = {
  PENDING_ASSIGNMENT: "pendiente de asignacion", ACCEPTED: "aceptado por un motorizado",
  HEADING_TO_PICKUP: "en camino al recojo", PICKED_UP: "recogido",
  HEADING_TO_DESTINATION: "en camino al destino", DELIVERED: "entregado", CANCELLED: "cancelado",
};

export function normalizePeruvianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^9\d{8}$/.test(digits)) return `51${digits}`;
  if (/^519\d{8}$/.test(digits)) return digits;
  return null;
}

export function orderWhatsAppUrl(order: OrderNotification) {
  const phone = normalizePeruvianPhone(order.recipientPhone);
  if (!phone) return null;
  const status = statusLabels[order.status] ?? order.status.toLowerCase();
  const message = `Hola ${order.recipientName}, tu pedido ${order.publicCode} en EntregaPyme esta ${status}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
