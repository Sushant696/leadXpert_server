export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const;

export const System_Roles = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;


export type Role_Type = typeof Roles[keyof typeof Roles];
export type System_Role_Type = typeof Roles[keyof typeof Roles];



