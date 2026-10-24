import { describe, expect, it } from "vitest";

import { adminOrderQuerySchema, assignOrderInputSchema } from "./admin-order-input";

describe("administracion de pedidos", () => {
  it("normaliza paginacion y limita el tamano", () => {
    expect(adminOrderQuerySchema.parse({}).page).toBe(1);
    expect(adminOrderQuerySchema.safeParse({ page: 0, limit: 101 }).success).toBe(false);
  });

  it("exige un motorizado para asignar", () => {
    expect(assignOrderInputSchema.safeParse({ courierId: "courier-1" }).success).toBe(true);
    expect(assignOrderInputSchema.safeParse({ courierId: "" }).success).toBe(false);
  });
});
