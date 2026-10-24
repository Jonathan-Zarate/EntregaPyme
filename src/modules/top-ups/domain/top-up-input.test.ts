import { describe, expect, it } from "vitest";

import { topUpRequestSchema } from "./top-up-input";

describe("topUpRequestSchema", () => {
  it("convierte el monto del formulario y acepta una solicitud valida", () => {
    const result = topUpRequestSchema.parse({ amount: "150.50", operationCode: "OP-12345", evidenceUrl: "" });
    expect(result.amount).toBe(150.5);
    expect(result.evidenceUrl).toBeNull();
  });

  it("rechaza montos fuera de los limites del MVP", () => {
    expect(topUpRequestSchema.safeParse({ amount: 5, operationCode: "OP-1" }).success).toBe(false);
    expect(topUpRequestSchema.safeParse({ amount: 20000, operationCode: "OP-2" }).success).toBe(false);
  });
});
