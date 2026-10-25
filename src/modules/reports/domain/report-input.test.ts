import { describe, expect, it } from "vitest";
import { csvCell, reportQuerySchema } from "./report-input";

describe("reportes administrativos", () => {
  it("rechaza rangos invertidos", () => expect(reportQuerySchema.safeParse({ from: "2026-10-25", to: "2026-10-24" }).success).toBe(false));
  it("neutraliza formulas en CSV", () => expect(csvCell("=HYPERLINK(1)")).toBe('"\'=HYPERLINK(1)"'));
  it("escapa comillas en CSV", () => expect(csvCell('Cliente "A"')).toBe('"Cliente ""A"""'));
});
