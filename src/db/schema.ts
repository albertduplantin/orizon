import { pgTable, text, timestamp, boolean, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// CORE MODELS - Authentication & Users
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text('clerkId').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: uniqueIndex('users_clerkId_key').on(table.clerkId),
  emailIdx: uniqueIndex('users_email_key').on(table.email),
}));

export const usersRelations = relations(users, ({ many }) => ({
  tenantMembers: many(tenantMembers),
  volunteers: many(volunteers),
}));

// ============================================
// MULTITENANT MODELS
// ============================================

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  eventStartDate: timestamp('eventStartDate'),
  eventEndDate: timestamp('eventEndDate'),

  // Billing
  stripeCustomerId: text('stripeCustomerId').unique(),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  subscriptionStatus: text('subscriptionStatus').default('free'),
  plan: text('plan').default('free'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('tenants_slug_key').on(table.slug),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  members: many(tenantMembers),
  modules: many(tenantModules),
  inviteCodes: many(inviteCodes),
  roles: many(roles),
  volunteers: many(volunteers),
  volunteerMissions: many(volunteerMissions),
}));

export const tenantMembers = pgTable('tenant_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
}, (table) => ({
  tenantUserIdx: uniqueIndex('tenant_members_tenantId_userId_key').on(table.tenantId, table.userId),
  tenantIdIdx: index('tenant_members_tenantId_idx').on(table.tenantId),
  userIdIdx: index('tenant_members_userId_idx').on(table.userId),
}));

export const tenantMembersRelations = relations(tenantMembers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMembers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantMembers.userId],
    references: [users.id],
  }),
}));

export const tenantModules = pgTable('tenant_modules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  moduleId: text('moduleId').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  activatedAt: timestamp('activatedAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt'),
  billingStatus: text('billingStatus').default('granted').notNull(),
}, (table) => ({
  tenantModuleIdx: uniqueIndex('tenant_modules_tenantId_moduleId_key').on(table.tenantId, table.moduleId),
  tenantIdIdx: index('tenant_modules_tenantId_idx').on(table.tenantId),
}));

export const tenantModulesRelations = relations(tenantModules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantModules.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// RBAC - Roles & Permissions
// ============================================

export const roles = pgTable('roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  moduleId: text('moduleId'),
  name: text('name').notNull(),
  description: text('description'),
  permissions: text('permissions').array().notNull(),
  isSystem: boolean('isSystem').default(false).notNull(),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  tenantModuleNameIdx: uniqueIndex('roles_tenantId_moduleId_name_key').on(table.tenantId, table.moduleId, table.name),
  tenantIdIdx: index('roles_tenantId_idx').on(table.tenantId),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  assignments: many(userRoles),
}));

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull(),
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull(),
  scope: text('scope'),
  assignedAt: timestamp('assignedAt').defaultNow().notNull(),
}, (table) => ({
  userRoleTenantIdx: uniqueIndex('user_roles_userId_roleId_tenantId_key').on(table.userId, table.roleId, table.tenantId),
  userIdIdx: index('user_roles_userId_idx').on(table.userId),
  tenantIdIdx: index('user_roles_tenantId_idx').on(table.tenantId),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

// ============================================
// INVITATION SYSTEM
// ============================================

export const inviteCodes = pgTable('invite_codes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  moduleId: text('moduleId'),
  role: text('role').notNull(),
  maxUses: integer('maxUses').default(1).notNull(),
  uses: integer('uses').default(0).notNull(),
  expiresAt: timestamp('expiresAt'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('invite_codes_code_key').on(table.code),
  tenantIdIdx: index('invite_codes_tenantId_idx').on(table.tenantId),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [inviteCodes.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// MODULE: VOLUNTEERS (MVP)
// ============================================

export const volunteers = pgTable('volunteers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending').notNull(),
  skills: text('skills').array().notNull(),
  availability: text('availability'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  tenantUserIdx: uniqueIndex('volunteers_tenantId_userId_key').on(table.tenantId, table.userId),
  tenantIdIdx: index('volunteers_tenantId_idx').on(table.tenantId),
  userIdIdx: index('volunteers_userId_idx').on(table.userId),
}));

export const volunteersRelations = relations(volunteers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [volunteers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [volunteers.userId],
    references: [users.id],
  }),
  assignments: many(volunteerAssignments),
}));

export const volunteerMissions = pgTable('volunteer_missions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  requiredCount: integer('requiredCount').default(1).notNull(),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  location: text('location'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  tenantIdIdx: index('volunteer_missions_tenantId_idx').on(table.tenantId),
}));

export const volunteerMissionsRelations = relations(volunteerMissions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [volunteerMissions.tenantId],
    references: [tenants.id],
  }),
  assignments: many(volunteerAssignments),
}));

export const volunteerRoles = pgTable('volunteer_roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  tenantNameIdx: uniqueIndex('volunteer_roles_tenantId_name_key').on(table.tenantId, table.name),
  tenantIdIdx: index('volunteer_roles_tenantId_idx').on(table.tenantId),
}));

export const volunteerAssignments = pgTable('volunteer_assignments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull(),
  volunteerId: text('volunteerId').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  missionId: text('missionId').notNull().references(() => volunteerMissions.id, { onDelete: 'cascade' }),
  roleId: text('roleId'),
  status: text('status').default('assigned').notNull(),
  notes: text('notes'),
  assignedAt: timestamp('assignedAt').defaultNow().notNull(),
}, (table) => ({
  volunteerMissionIdx: uniqueIndex('volunteer_assignments_volunteerId_missionId_key').on(table.volunteerId, table.missionId),
  tenantIdIdx: index('volunteer_assignments_tenantId_idx').on(table.tenantId),
  volunteerIdIdx: index('volunteer_assignments_volunteerId_idx').on(table.volunteerId),
  missionIdIdx: index('volunteer_assignments_missionId_idx').on(table.missionId),
}));

export const volunteerAssignmentsRelations = relations(volunteerAssignments, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [volunteerAssignments.volunteerId],
    references: [volunteers.id],
  }),
  mission: one(volunteerMissions, {
    fields: [volunteerAssignments.missionId],
    references: [volunteerMissions.id],
  }),
}));
