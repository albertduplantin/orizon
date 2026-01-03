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
  // Communication permissions
  | "communication.view"
  | "communication.send"
  | "communication.channels.create"
  | "communication.channels.manage"
  | "communication.moderate"
  | "communication.ai.generate"
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
    "communication.view",
    "communication.send",
    "communication.channels.create",
    "communication.channels.manage",
    "communication.moderate",
    "communication.ai.generate",
  ],
  module_manager: [
    "volunteers.view",
    "volunteers.create",
    "volunteers.assign",
    "communication.view",
    "communication.send",
    "communication.channels.create",
    "communication.moderate",
  ],
  member: [
    "volunteers.view",
    "communication.view",
    "communication.send",
  ],
  volunteer: [
    "volunteers.view",
    "communication.view",
  ],
};

// Permissions spécifiques aux rôles de channel
export const CHANNEL_ROLE_PERMISSIONS = {
  admin: [
    "channel.manage",
    "channel.invite",
    "channel.moderate",
    "channel.pin",
    "channel.archive",
    "channel.delete",
  ],
  moderator: [
    "channel.moderate",
    "channel.invite",
    "channel.pin",
  ],
  member: [
    "channel.read",
    "channel.write",
    "channel.react",
  ],
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
