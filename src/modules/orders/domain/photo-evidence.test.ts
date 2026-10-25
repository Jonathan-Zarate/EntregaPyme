import { describe, expect, it } from "vitest";
import { isOrderBlobUrl } from "./photo-evidence";

describe("evidencia fotografica", () => {
  it("acepta solamente el Blob del pedido", () => {
    expect(isOrderBlobUrl("https://store.private.blob.vercel-storage.com/delivery-evidence/order-1/photo-a.jpg", "order-1")).toBe(true);
    expect(isOrderBlobUrl("https://example.com/delivery-evidence/order-1/photo.jpg", "order-1")).toBe(false);
    expect(isOrderBlobUrl("https://store.private.blob.vercel-storage.com/delivery-evidence/order-2/photo.jpg", "order-1")).toBe(false);
  });
});
