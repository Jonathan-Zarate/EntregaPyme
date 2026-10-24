import { describe, expect, it } from "vitest";

import { buildVerificationEmail } from "../modules/auth/domain/verification-email-template";

describe("buildVerificationEmail", () => {
  it("incluye el enlace de verificacion", () => {
    const email = buildVerificationEmail("Ana", "https://example.test/verify?token=abc");
    expect(email.subject).toContain("Verifica");
    expect(email.html).toContain("https://example.test/verify?token=abc");
  });

  it("escapa datos del usuario antes de insertarlos en HTML", () => {
    const email = buildVerificationEmail("<script>alert(1)</script>", "https://example.test/?a=1&b=2");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("a=1&amp;b=2");
  });
});
