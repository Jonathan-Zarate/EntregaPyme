import { describe, expect, it } from "vitest";

import { orderInputSchema, quoteInputSchema } from "./order-input";

describe("quoteInputSchema", () => {
  it("exige origen y destino", () => {
    expect(quoteInputSchema.safeParse({ pickupDistrictId: "a", deliveryDistrictId: "b" }).success).toBe(true);
    expect(quoteInputSchema.safeParse({ pickupDistrictId: "a" }).success).toBe(false);
  });
});

describe("orderInputSchema", () => {
  it("valida los datos operativos del pedido", () => {
    const result = orderInputSchema.safeParse({
      pickupDistrictId: "a",
      pickupAddress: "Av. Espana 123",
      deliveryDistrictId: "b",
      deliveryAddress: "Av. Larco 456",
      recipientName: "Ana Torres",
      recipientPhone: "987654321",
      packageType: "SMALL",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza tipos de paquete inventados", () => {
    const result = orderInputSchema.safeParse({
      pickupDistrictId: "a",
      pickupAddress: "Av. Espana 123",
      deliveryDistrictId: "b",
      deliveryAddress: "Av. Larco 456",
      recipientName: "Ana Torres",
      recipientPhone: "987654321",
      packageType: "ENORME",
    });
    expect(result.success).toBe(false);
  });
});
