import { describe, expect, it } from "vitest";

import { blockCourierInputSchema } from "./courier-review";

describe("revision de motorizados", () => {
  it("exige un motivo concreto para bloquear", () => {
    expect(blockCourierInputSchema.safeParse({ reason: "DNI vencido" }).success).toBe(true);
    expect(blockCourierInputSchema.safeParse({ reason: "No" }).success).toBe(false);
  });
});
