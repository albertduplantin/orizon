CREATE TABLE "ai_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"channelId" text NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"summary" text NOT NULL,
	"actionItems" text,
	"keyTopics" text[],
	"participantsCount" integer,
	"messagesCount" integer,
	"model" text DEFAULT 'deepseek-chat' NOT NULL,
	"tokensUsed" integer,
	"generatedBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel_members" (
	"id" text PRIMARY KEY NOT NULL,
	"channelId" text NOT NULL,
	"userId" text NOT NULL,
	"tenantId" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"notificationLevel" text DEFAULT 'all' NOT NULL,
	"isMuted" boolean DEFAULT false NOT NULL,
	"lastReadAt" timestamp,
	"lastReadMessageId" text,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"invitedBy" text
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'public' NOT NULL,
	"moduleId" text,
	"topic" text,
	"pinnedMessageIds" text[] DEFAULT '{}',
	"isArchived" boolean DEFAULT false NOT NULL,
	"archivedAt" timestamp,
	"archivedBy" text,
	"autoArchiveAfterDays" integer,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"code" text NOT NULL,
	"moduleId" text,
	"role" text NOT NULL,
	"maxUses" integer DEFAULT 1 NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tenantId" text NOT NULL,
	"bio" text,
	"skills" text[],
	"availabilityWeekends" boolean DEFAULT false,
	"availabilityEvenings" boolean DEFAULT false,
	"availabilitySchoolHolidays" boolean DEFAULT false,
	"unavailableDates" text,
	"hasDriverLicense" boolean DEFAULT false,
	"hasVehicle" boolean DEFAULT false,
	"vehicleSeats" integer,
	"city" text,
	"postalCode" text,
	"maxTravelDistance" integer,
	"preferredMissionTypes" text[],
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tenantId" text NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"amount" integer NOT NULL,
	"paymentMethod" text,
	"paymentStatus" text DEFAULT 'pending' NOT NULL,
	"paidAt" timestamp,
	"helloAssoPaymentId" text,
	"helloAssoFormUrl" text,
	"stripePaymentIntentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"channelId" text NOT NULL,
	"tenantId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"parentMessageId" text,
	"mentions" text[] DEFAULT '{}',
	"reactions" text,
	"isEdited" boolean DEFAULT false NOT NULL,
	"editedAt" timestamp,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_clearance" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"resourceType" text NOT NULL,
	"resourceId" text NOT NULL,
	"requiredClearance" integer DEFAULT 1 NOT NULL,
	"customPermissions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"moduleId" text,
	"name" text NOT NULL,
	"description" text,
	"permissions" text[] NOT NULL,
	"isSystem" boolean DEFAULT false NOT NULL,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_members" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"clearanceLevel" integer DEFAULT 1 NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"moduleId" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"activatedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	"billingStatus" text DEFAULT 'granted' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"website" text,
	"eventStartDate" timestamp,
	"eventEndDate" timestamp,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"subscriptionStatus" text DEFAULT 'free',
	"plan" text DEFAULT 'free',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_stripeCustomerId_unique" UNIQUE("stripeCustomerId"),
	CONSTRAINT "tenants_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "unread_counts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"channelId" text NOT NULL,
	"tenantId" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"mentionCount" integer DEFAULT 0 NOT NULL,
	"lastMessageAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"roleId" text NOT NULL,
	"tenantId" text NOT NULL,
	"scope" text,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerkId" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volunteer_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"volunteerId" text NOT NULL,
	"missionId" text NOT NULL,
	"roleId" text,
	"status" text DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tenantId" text NOT NULL,
	"date" timestamp NOT NULL,
	"hours" integer NOT NULL,
	"missionId" text,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"validatedBy" text,
	"validatedAt" timestamp,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_missions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requiredCount" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"location" text,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"userId" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"skills" text[] NOT NULL,
	"availability" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_clearance" ADD CONSTRAINT "resource_clearance_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unread_counts" ADD CONSTRAINT "unread_counts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unread_counts" ADD CONSTRAINT "unread_counts_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_volunteerId_volunteers_id_fk" FOREIGN KEY ("volunteerId") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_missionId_volunteer_missions_id_fk" FOREIGN KEY ("missionId") REFERENCES "public"."volunteer_missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_missionId_volunteer_missions_id_fk" FOREIGN KEY ("missionId") REFERENCES "public"."volunteer_missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_hours" ADD CONSTRAINT "volunteer_hours_validatedBy_users_id_fk" FOREIGN KEY ("validatedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_missions" ADD CONSTRAINT "volunteer_missions_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_summaries_channelId_idx" ON "ai_summaries" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "ai_summaries_tenantId_idx" ON "ai_summaries" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "ai_summaries_endDate_idx" ON "ai_summaries" USING btree ("endDate");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_members_channelId_userId_key" ON "channel_members" USING btree ("channelId","userId");--> statement-breakpoint
CREATE INDEX "channel_members_channelId_idx" ON "channel_members" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "channel_members_userId_idx" ON "channel_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "channel_members_tenantId_idx" ON "channel_members" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "channels_tenantId_slug_key" ON "channels" USING btree ("tenantId","slug");--> statement-breakpoint
CREATE INDEX "channels_tenantId_idx" ON "channels" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "channels_moduleId_idx" ON "channels" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "channels_type_idx" ON "channels" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "invite_codes_tenantId_idx" ON "invite_codes" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "member_profiles_userId_tenantId_key" ON "member_profiles" USING btree ("userId","tenantId");--> statement-breakpoint
CREATE INDEX "member_profiles_tenantId_idx" ON "member_profiles" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "memberships_userId_tenantId_idx" ON "memberships" USING btree ("userId","tenantId");--> statement-breakpoint
CREATE INDEX "memberships_tenantId_idx" ON "memberships" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "memberships_status_idx" ON "memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "memberships_endDate_idx" ON "memberships" USING btree ("endDate");--> statement-breakpoint
CREATE INDEX "messages_channelId_idx" ON "messages" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "messages_channelId_createdAt_idx" ON "messages" USING btree ("channelId","createdAt");--> statement-breakpoint
CREATE INDEX "messages_userId_idx" ON "messages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "messages_tenantId_idx" ON "messages" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_clearance_resourceType_resourceId_key" ON "resource_clearance" USING btree ("resourceType","resourceId");--> statement-breakpoint
CREATE INDEX "resource_clearance_tenantId_idx" ON "resource_clearance" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "resource_clearance_requiredClearance_idx" ON "resource_clearance" USING btree ("requiredClearance");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_tenantId_moduleId_name_key" ON "roles" USING btree ("tenantId","moduleId","name");--> statement-breakpoint
CREATE INDEX "roles_tenantId_idx" ON "roles" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_members_tenantId_userId_key" ON "tenant_members" USING btree ("tenantId","userId");--> statement-breakpoint
CREATE INDEX "tenant_members_tenantId_idx" ON "tenant_members" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "tenant_members_userId_idx" ON "tenant_members" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_modules_tenantId_moduleId_key" ON "tenant_modules" USING btree ("tenantId","moduleId");--> statement-breakpoint
CREATE INDEX "tenant_modules_tenantId_idx" ON "tenant_modules" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "unread_counts_userId_channelId_key" ON "unread_counts" USING btree ("userId","channelId");--> statement-breakpoint
CREATE INDEX "unread_counts_userId_idx" ON "unread_counts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "unread_counts_tenantId_idx" ON "unread_counts" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_userId_roleId_tenantId_key" ON "user_roles" USING btree ("userId","roleId","tenantId");--> statement-breakpoint
CREATE INDEX "user_roles_userId_idx" ON "user_roles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_roles_tenantId_idx" ON "user_roles" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerkId_key" ON "users" USING btree ("clerkId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_assignments_volunteerId_missionId_key" ON "volunteer_assignments" USING btree ("volunteerId","missionId");--> statement-breakpoint
CREATE INDEX "volunteer_assignments_tenantId_idx" ON "volunteer_assignments" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "volunteer_assignments_volunteerId_idx" ON "volunteer_assignments" USING btree ("volunteerId");--> statement-breakpoint
CREATE INDEX "volunteer_assignments_missionId_idx" ON "volunteer_assignments" USING btree ("missionId");--> statement-breakpoint
CREATE INDEX "volunteer_hours_userId_tenantId_idx" ON "volunteer_hours" USING btree ("userId","tenantId");--> statement-breakpoint
CREATE INDEX "volunteer_hours_tenantId_idx" ON "volunteer_hours" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "volunteer_hours_status_idx" ON "volunteer_hours" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_hours_date_idx" ON "volunteer_hours" USING btree ("date");--> statement-breakpoint
CREATE INDEX "volunteer_missions_tenantId_idx" ON "volunteer_missions" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "volunteer_missions_status_idx" ON "volunteer_missions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_roles_tenantId_name_key" ON "volunteer_roles" USING btree ("tenantId","name");--> statement-breakpoint
CREATE INDEX "volunteer_roles_tenantId_idx" ON "volunteer_roles" USING btree ("tenantId");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteers_tenantId_userId_key" ON "volunteers" USING btree ("tenantId","userId");--> statement-breakpoint
CREATE INDEX "volunteers_tenantId_idx" ON "volunteers" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "volunteers_userId_idx" ON "volunteers" USING btree ("userId");