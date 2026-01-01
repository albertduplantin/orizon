// RBAC Permission System

export type Permission =
  | "volunteers.view"
  | "volunteers.create"
  | "volunteers.assign"
  | "volunteers.roles.manage"
  | "ticketing.view"
  | "ticketing.orders.manage"
  | "finance.view"
  | "finance.edit"
  | "settings.tenant.manage"
  | "*"; // Super admin wildcard

export type SystemRole = "super_admin" | "tenant_admin" | "module_manager" | "member" | "volunteer";

export const SYSTEM_ROLES: Record<SystemRole, Permission[]> = {
  super_admin: ["*"],
  tenant_admin: [
    "settings.tenant.manage",
    "volunteers.view",
    "volunteers.create",
    "volunteers.assign",
    "volunteers.roles.manage",
  ],
  module_manager: ["volunteers.view", "volunteers.create", "volunteers.assign"],
  member: ["volunteers.view"],
  volunteer: ["volunteers.view"],
};

export async function checkPermission(
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<boolean> {
  // TODO: Implement permission checking logic
  // This will query the database to get user roles and permissions
  return false;
}

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  // Super admin bypass
  if (userPermissions.includes("*")) {
    return true;
  }

  // Check specific permission
  return userPermissions.includes(requiredPermission);
}
