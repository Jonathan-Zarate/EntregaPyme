import { describe, expect, it } from "vitest";
import { canAccessRole, isActiveUser } from "./access-policy";

describe("politica de acceso", () => {
  it("permite a un usuario activo", () => {
    expect(isActiveUser({ role: "COMPANY", status: "ACTIVE", banned: false })).toBe(true);
  });

  it("rechaza usuarios bloqueados aunque conserven un rol valido", () => {
    expect(canAccessRole({ role: "ADMIN", status: "BLOCKED", banned: true }, ["ADMIN"])).toBe(false);
  });

  it("rechaza un rol distinto al requerido", () => {
    expect(canAccessRole({ role: "COURIER", status: "ACTIVE", banned: false }, ["ADMIN"])).toBe(false);
  });

  it("permite cualquiera de los roles declarados", () => {
    expect(canAccessRole({ role: "COURIER", status: "ACTIVE", banned: false }, ["COMPANY", "COURIER"])).toBe(true);
  });
});
