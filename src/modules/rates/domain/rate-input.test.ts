import { describe, expect, it } from "vitest";

import { rateInputSchema, updateRateInputSchema } from "./rate-input";

describe("tarifas de delivery", () => {
  it("acepta precio, pago y margen validos", () => {
    expect(rateInputSchema.safeParse({ originDistrictId: "a", destinationDistrictId: "b", companyPrice: 18, courierPayment: 14 }).success).toBe(true);
  });

  it("rechaza un pago mayor al precio o importes no positivos", () => {
    expect(updateRateInputSchema.safeParse({ companyPrice: 10, courierPayment: 11 }).success).toBe(false);
    expect(updateRateInputSchema.safeParse({ companyPrice: 0, courierPayment: 0 }).success).toBe(false);
  });
});
