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
  role: text('role').default('user').notNull(), // user | super_admin
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
  channels: many(channels),
  aiSummaries: many(aiSummaries),
  memberProfiles: many(memberProfiles),
  memberships: many(memberships),
  volunteerHours: many(volunteerHours),
}));

export const tenantMembers = pgTable('tenant_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  clearanceLevel: integer('clearanceLevel').notNull().default(1), // Rainbow Clearance: 0-6 (infrared to ultraviolet)
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

// ============================================
// MODULE: COMMUNICATION
// ============================================

export const channels = pgTable('channels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Identification
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),

  // Type détermine le comportement
  type: text('type').notNull().default('public'),
  // 'public' | 'private' | 'direct' | 'module' | 'broadcast'

  // Association au module (null si channel général)
  moduleId: text('moduleId'),

  // Métadonnées
  topic: text('topic'),
  pinnedMessageIds: text('pinnedMessageIds').array().default([]),

  // Archivage
  isArchived: boolean('isArchived').default(false).notNull(),
  archivedAt: timestamp('archivedAt'),
  archivedBy: text('archivedBy'),
  autoArchiveAfterDays: integer('autoArchiveAfterDays'),

  // Création
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('channels_tenantId_slug_key').on(table.tenantId, table.slug),
  tenantIdIdx: index('channels_tenantId_idx').on(table.tenantId),
  moduleIdIdx: index('channels_moduleId_idx').on(table.moduleId),
  typeIdx: index('channels_type_idx').on(table.type),
}));

export const channelMembers = pgTable('channel_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text('channelId').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull(),

  // Rôle dans le channel (admin, moderator, member)
  role: text('role').notNull().default('member'),

  // Préférences notifications
  notificationLevel: text('notificationLevel').default('all').notNull(),
  // 'all' | 'mentions' | 'none'
  isMuted: boolean('isMuted').default(false).notNull(),

  // Tracking lecture
  lastReadAt: timestamp('lastReadAt'),
  lastReadMessageId: text('lastReadMessageId'),

  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
  invitedBy: text('invitedBy'),
}, (table) => ({
  channelUserIdx: uniqueIndex('channel_members_channelId_userId_key')
    .on(table.channelId, table.userId),
  channelIdIdx: index('channel_members_channelId_idx').on(table.channelId),
  userIdIdx: index('channel_members_userId_idx').on(table.userId),
  tenantIdIdx: index('channel_members_tenantId_idx').on(table.tenantId),
}));

export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text('channelId').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'set null' }),

  // Contenu
  content: text('content').notNull(),
  type: text('type').default('text').notNull(),
  // 'text' | 'system' | 'ai-summary' | 'task'

  // Threading (pour plus tard)
  parentMessageId: text('parentMessageId'),

  // Métadonnées
  mentions: text('mentions').array().default([]),
  reactions: text('reactions'), // JSON: { emoji: [userId, ...] }

  // Édition/Suppression
  isEdited: boolean('isEdited').default(false).notNull(),
  editedAt: timestamp('editedAt'),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  channelIdIdx: index('messages_channelId_idx').on(table.channelId),
  channelCreatedIdx: index('messages_channelId_createdAt_idx')
    .on(table.channelId, table.createdAt),
  userIdIdx: index('messages_userId_idx').on(table.userId),
  tenantIdIdx: index('messages_tenantId_idx').on(table.tenantId),
}));

export const unreadCounts = pgTable('unread_counts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channelId: text('channelId').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull(),

  count: integer('count').default(0).notNull(),
  mentionCount: integer('mentionCount').default(0).notNull(),

  lastMessageAt: timestamp('lastMessageAt'),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  userChannelIdx: uniqueIndex('unread_counts_userId_channelId_key')
    .on(table.userId, table.channelId),
  userIdIdx: index('unread_counts_userId_idx').on(table.userId),
  tenantIdIdx: index('unread_counts_tenantId_idx').on(table.tenantId),
}));

export const aiSummaries = pgTable('ai_summaries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  channelId: text('channelId').notNull().references(() => channels.id, { onDelete: 'cascade' }),

  // Période couverte
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),

  // Résumé généré
  summary: text('summary').notNull(),
  actionItems: text('actionItems'), // JSON array
  keyTopics: text('keyTopics').array(),
  participantsCount: integer('participantsCount'),
  messagesCount: integer('messagesCount'),

  // Métadonnées génération
  model: text('model').default('deepseek-chat').notNull(),
  tokensUsed: integer('tokensUsed'),
  generatedBy: text('generatedBy'), // 'auto' | userId

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  channelIdIdx: index('ai_summaries_channelId_idx').on(table.channelId),
  tenantIdIdx: index('ai_summaries_tenantId_idx').on(table.tenantId),
  dateIdx: index('ai_summaries_endDate_idx').on(table.endDate),
}));

// Relations
export const channelsRelations = relations(channels, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [channels.tenantId],
    references: [tenants.id],
  }),
  messages: many(messages),
  members: many(channelMembers),
  summaries: many(aiSummaries),
}));

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
  channel: one(channels, {
    fields: [channelMembers.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [channelMembers.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const aiSummariesRelations = relations(aiSummaries, ({ one }) => ({
  channel: one(channels, {
    fields: [aiSummaries.channelId],
    references: [channels.id],
  }),
  tenant: one(tenants, {
    fields: [aiSummaries.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// RAINBOW CLEARANCE SYSTEM
// ============================================
// Clearance Levels:
// 0: INFRARED - Public (general event info)
// 1: RED - Participant (basic info)
// 2: ORANGE - Volunteer (missions, planning)
// 3: YELLOW - Coordinator (team management)
// 4: GREEN - Module Manager (stats, budgets)
// 5: BLUE - Tenant Admin (full config)
// 6: ULTRAVIOLET - Super Admin (everything)

export const resourceClearance = pgTable('resource_clearance', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Resource identification
  resourceType: text('resourceType').notNull(), // 'channel' | 'message' | 'volunteer_mission' | 'document' | 'module'
  resourceId: text('resourceId').notNull(),

  // Clearance required to access this resource
  requiredClearance: integer('requiredClearance').notNull().default(1),

  // Optional: specific permissions override
  customPermissions: text('customPermissions'), // JSON array of permission strings

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  resourceIdx: uniqueIndex('resource_clearance_resourceType_resourceId_key').on(table.resourceType, table.resourceId),
  tenantIdIdx: index('resource_clearance_tenantId_idx').on(table.tenantId),
  clearanceIdx: index('resource_clearance_requiredClearance_idx').on(table.requiredClearance),
}));

export const resourceClearanceRelations = relations(resourceClearance, ({ one }) => ({
  tenant: one(tenants, {
    fields: [resourceClearance.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// MEMBER PROFILES & MANAGEMENT
// ============================================

export const memberProfiles = pgTable('member_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Personal info
  bio: text('bio'),
  skills: text('skills').array(), // ['Graphisme', 'Compta', 'Logistique']

  // Availability
  availabilityWeekends: boolean('availabilityWeekends').default(false),
  availabilityEvenings: boolean('availabilityEvenings').default(false),
  availabilitySchoolHolidays: boolean('availabilitySchoolHolidays').default(false),
  unavailableDates: text('unavailableDates'), // JSON: [{start, end}]

  // Logistics
  hasDriverLicense: boolean('hasDriverLicense').default(false),
  hasVehicle: boolean('hasVehicle').default(false),
  vehicleSeats: integer('vehicleSeats'),

  // Location
  city: text('city'),
  postalCode: text('postalCode'),
  maxTravelDistance: integer('maxTravelDistance'), // km

  // Preferences
  preferredMissionTypes: text('preferredMissionTypes').array(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  userTenantIdx: uniqueIndex('member_profiles_userId_tenantId_key').on(table.userId, table.tenantId),
  tenantIdIdx: index('member_profiles_tenantId_idx').on(table.tenantId),
}));

export const memberProfilesRelations = relations(memberProfiles, ({ one }) => ({
  user: one(users, {
    fields: [memberProfiles.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [memberProfiles.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// MEMBERSHIPS & COTISATIONS
// ============================================

export const memberships = pgTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Membership period
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  status: text('status').default('active').notNull(), // 'pending', 'active', 'expired', 'cancelled'

  // Payment
  amount: integer('amount').notNull(), // Amount in cents (e.g., 2000 = 20€)
  paymentMethod: text('paymentMethod'), // 'hello_asso', 'stripe', 'paypal', 'cash', 'check'
  paymentStatus: text('paymentStatus').default('pending').notNull(), // 'pending', 'paid', 'refunded'
  paidAt: timestamp('paidAt'),

  // HelloAsso integration
  helloAssoPaymentId: text('helloAssoPaymentId'),
  helloAssoFormUrl: text('helloAssoFormUrl'),

  // Stripe integration (fallback)
  stripePaymentIntentId: text('stripePaymentIntentId'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  userTenantIdx: index('memberships_userId_tenantId_idx').on(table.userId, table.tenantId),
  tenantIdIdx: index('memberships_tenantId_idx').on(table.tenantId),
  statusIdx: index('memberships_status_idx').on(table.status),
  endDateIdx: index('memberships_endDate_idx').on(table.endDate),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [memberships.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================
// VOLUNTEER HOURS TRACKING
// ============================================

export const volunteerHours = pgTable('volunteer_hours', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenantId').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Hours details
  date: timestamp('date').notNull(),
  hours: integer('hours').notNull(), // Hours in minutes (e.g., 150 = 2.5 hours)

  // Context
  missionId: text('missionId').references(() => volunteerMissions.id, { onDelete: 'set null' }),
  description: text('description'),

  // Validation
  status: text('status').default('pending').notNull(), // 'pending', 'validated', 'rejected'
  validatedBy: text('validatedBy').references(() => users.id, { onDelete: 'set null' }),
  validatedAt: timestamp('validatedAt'),
  rejectionReason: text('rejectionReason'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  userTenantIdx: index('volunteer_hours_userId_tenantId_idx').on(table.userId, table.tenantId),
  tenantIdIdx: index('volunteer_hours_tenantId_idx').on(table.tenantId),
  statusIdx: index('volunteer_hours_status_idx').on(table.status),
  dateIdx: index('volunteer_hours_date_idx').on(table.date),
}));

export const volunteerHoursRelations = relations(volunteerHours, ({ one }) => ({
  user: one(users, {
    fields: [volunteerHours.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [volunteerHours.tenantId],
    references: [tenants.id],
  }),
  mission: one(volunteerMissions, {
    fields: [volunteerHours.missionId],
    references: [volunteerMissions.id],
  }),
  validator: one(users, {
    fields: [volunteerHours.validatedBy],
    references: [users.id],
  }),
}));
