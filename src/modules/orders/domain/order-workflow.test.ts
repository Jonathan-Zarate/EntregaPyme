import { describe, expect, it } from "vitest";

import { canCompanyCancel, deliveryEvidenceInputSchema, getNextCourierStatus, isValidCourierTransition } from "./order-workflow";

describe("flujo operativo del pedido", () => {
  it("solo permite avanzar un estado a la vez", () => {
    expect(isValidCourierTransition("ACCEPTED", "HEADING_TO_PICKUP")).toBe(true);
    expect(isValidCourierTransition("ACCEPTED", "PICKED_UP")).toBe(false);
    expect(getNextCourierStatus("HEADING_TO_DESTINATION")).toBe("DELIVERED");
    expect(getNextCourierStatus("DELIVERED")).toBeNull();
  });

  it("exige contenido segun el tipo de evidencia", () => {
    expect(deliveryEvidenceInputSchema.safeParse({ type: "COMMENT", comment: "Recibido por Ana" }).success).toBe(true);
    expect(deliveryEvidenceInputSchema.safeParse({ type: "COMMENT", comment: "" }).success).toBe(false);
    expect(deliveryEvidenceInputSchema.safeParse({ type: "PHOTO", url: "https://example.test/evidencia.jpg" }).success).toBe(true);
    expect(deliveryEvidenceInputSchema.safeParse({ type: "PHOTO" }).success).toBe(false);
  });

  it("permite cancelar solamente antes del recojo", () => {
    expect(canCompanyCancel("PENDING_ASSIGNMENT")).toBe(true);
    expect(canCompanyCancel("HEADING_TO_PICKUP")).toBe(true);
    expect(canCompanyCancel("PICKED_UP")).toBe(false);
    expect(canCompanyCancel("DELIVERED")).toBe(false);
  });
});
