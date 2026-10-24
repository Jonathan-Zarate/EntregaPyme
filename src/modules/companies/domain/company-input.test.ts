import { describe, expect, it } from "vitest";

import { companyInputSchema } from "./company-input";

const validCompany = {
  ruc: "20123456789",
  legalName: "Comercial Norte SAC",
  tradeName: "Comercial Norte",
  phone: "987654321",
  pickupAddress: "Av. Espana 123",
  pickupReference: "Puerta azul",
  districtId: "district-id",
};

describe("companyInputSchema", () => {
  it("acepta un negocio peruano valido", () => {
    expect(companyInputSchema.safeParse(validCompany).success).toBe(true);
  });

  it("rechaza un RUC que no corresponde a una persona juridica", () => {
    const result = companyInputSchema.safeParse({ ...validCompany, ruc: "10123456789" });
    expect(result.success).toBe(false);
  });

  it("normaliza los campos opcionales vacios", () => {
    const result = companyInputSchema.parse({ ...validCompany, tradeName: "", pickupReference: "" });
    expect(result.tradeName).toBeNull();
    expect(result.pickupReference).toBeNull();
  });
});
