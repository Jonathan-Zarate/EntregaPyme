export const APP_ROLES = ["ADMIN", "COMPANY", "COURIER"] as const;
export type AppRole = (typeof APP_ROLES)[number];

type AccessUser = {
  role: string;
  status: "ACTIVE" | "BLOCKED";
  banned: boolean;
};

export function isActiveUser(user: AccessUser) {
  return user.status === "ACTIVE" && !user.banned;
}

export function canAccessRole(user: AccessUser, allowedRoles: readonly AppRole[]) {
  return isActiveUser(user) && allowedRoles.includes(user.role as AppRole);
}
