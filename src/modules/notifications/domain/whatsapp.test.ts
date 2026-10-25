import { describe, expect, it } from "vitest";
import { normalizePeruvianPhone, orderWhatsAppUrl } from "./whatsapp";

describe("enlaces de WhatsApp", () => {
  it("agrega el prefijo peruano", () => expect(normalizePeruvianPhone("987 654 321")).toBe("51987654321"));
  it("rechaza telefonos ambiguos", () => expect(normalizePeruvianPhone("12345")).toBeNull());
  it("codifica el mensaje y no incluye direcciones", () => {
    const url = orderWhatsAppUrl({ publicCode: "EP-001", status: "PICKED_UP", recipientName: "Ana Perez", recipientPhone: "+51 987654321" });
    expect(url).toContain("https://wa.me/51987654321?text=");
    expect(decodeURIComponent(url ?? "")).toContain("pedido EP-001");
    expect(decodeURIComponent(url ?? "")).not.toContain("direccion");
  });
});
