import { describe, expect, it } from "vitest";

import { paginationSchema } from "./pagination";

describe("paginacion publica de API", () => {
  it("aplica valores seguros y rechaza limites excesivos", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationSchema.safeParse({ page: 1, limit: 101 }).success).toBe(false);
  });
});
