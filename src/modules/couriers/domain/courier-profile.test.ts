import { describe, expect, it } from "vitest";

import { courierProfileInputSchema } from "./courier-profile";

describe("perfil de motorizado", () => {
  it("acepta DNI, celular y placa validos", () => {
    expect(courierProfileInputSchema.safeParse({ documentType: "DNI", documentNumber: "70123456", phone: "987654321", vehiclePlate: "ABC-123" }).success).toBe(true);
  });

  it("rechaza documentos y telefonos incompletos", () => {
    expect(courierProfileInputSchema.safeParse({ documentType: "DNI", documentNumber: "123", phone: "555" }).success).toBe(false);
  });
});
