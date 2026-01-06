// RBAC Permission System with Rainbow Clearance Integration
import {
  ClearanceLevel,
  hasAccess as hasClearanceAccess,
  getClearanceForRole,
  CLEARANCE_LEVELS
} from "./clearance";

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

/**
 * Check if user has sufficient clearance to access a resource
 */
export async function checkClearance(
  userId: string,
  tenantId: string,
  requiredClearance: ClearanceLevel
): Promise<boolean> {
  const { db } = await import("@/db");
  const { tenantMembers, users } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Check if super admin (always has ultraviolet clearance)
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.role === "super_admin") {
    return true; // Super admin has ULTRAVIOLET clearance
  }

  // Get user's clearance level in this tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.userId, userId),
      eq(tenantMembers.tenantId, tenantId)
    ),
  });

  if (!membership) {
    return false; // User is not a member
  }

  return hasClearanceAccess(membership.clearanceLevel as ClearanceLevel, requiredClearance);
}

/**
 * Get user's clearance level in a tenant
 */
export async function getUserClearance(userId: string, tenantId: string): Promise<ClearanceLevel> {
  const { db } = await import("@/db");
  const { tenantMembers, users } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Check if super admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.role === "super_admin") {
    return CLEARANCE_LEVELS.ULTRAVIOLET;
  }

  // Get tenant membership
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.userId, userId),
      eq(tenantMembers.tenantId, tenantId)
    ),
  });

  return (membership?.clearanceLevel as ClearanceLevel) ?? CLEARANCE_LEVELS.INFRARED;
}

/**
 * Check resource-specific clearance
 */
export async function checkResourceAccess(
  userId: string,
  tenantId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  const { db } = await import("@/db");
  const { resourceClearance } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Get user's clearance
  const userClearanceLevel = await getUserClearance(userId, tenantId);

  // Check if resource has specific clearance requirement
  const resource = await db.query.resourceClearance.findFirst({
    where: and(
      eq(resourceClearance.tenantId, tenantId),
      eq(resourceClearance.resourceType, resourceType),
      eq(resourceClearance.resourceId, resourceId)
    ),
  });

  const requiredClearance = resource?.requiredClearance ?? CLEARANCE_LEVELS.RED;

  return hasClearanceAccess(userClearanceLevel, requiredClearance as ClearanceLevel);
}

export async function checkPermission(
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<boolean> {
  const { db } = await import("@/db");
  const { tenantMembers, users } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Check super admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.role === "super_admin") {
    return true;
  }

  // Get user's role in tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.userId, userId),
      eq(tenantMembers.tenantId, tenantId)
    ),
  });

  if (!membership) {
    return false;
  }

  // Get permissions for role
  const rolePermissions = SYSTEM_ROLES[membership.role as SystemRole] ?? [];

  return hasPermission(rolePermissions, permission);
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
