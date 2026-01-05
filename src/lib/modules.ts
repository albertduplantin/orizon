// Module System - Dynamic Module Loader

export type ModuleDefinition = {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  category: "management" | "commerce" | "communication" | "finance" | "organization";
  pricing: {
    free: boolean;
    tier: "base" | "premium" | "enterprise";
  };
  permissions: string[];
};

// Available modules registry
export const AVAILABLE_MODULES: Record<string, ModuleDefinition> = {
  volunteers: {
    id: "volunteers",
    name: "Gestion Bénévoles",
    description: "Recrutement, planning et suivi des bénévoles",
    version: "1.0.0",
    icon: "Users",
    category: "management",
    pricing: {
      free: true,
      tier: "base",
    },
    permissions: [
      "volunteers.view",
      "volunteers.create",
      "volunteers.assign",
      "volunteers.manage",
    ],
  },
  ticketing: {
    id: "ticketing",
    name: "Billetterie",
    description: "Gestion des billets et des inscriptions",
    version: "1.0.0",
    icon: "Ticket",
    category: "commerce",
    pricing: {
      free: false,
      tier: "premium",
    },
    permissions: ["ticketing.view", "ticketing.orders.manage", "ticketing.settings"],
  },
  communication: {
    id: "communication",
    name: "Communication",
    description: "Messagerie temps réel et collaboration d'équipe",
    version: "1.0.0",
    icon: "MessageSquare",
    category: "communication",
    pricing: {
      free: true,
      tier: "base",
    },
    permissions: [
      "communication.view",
      "communication.send",
      "communication.channels.create",
      "communication.channels.manage",
      "communication.moderate",
      "communication.ai.generate",
    ],
  },
  // Add more modules here as they are developed
};

export async function getActiveModules(tenantId: string): Promise<ModuleDefinition[]> {
  const { db } = await import("@/db");
  const { tenantModules } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Query database for active modules for this tenant
  const activeModuleRecords = await db.query.tenantModules.findMany({
    where: and(
      eq(tenantModules.tenantId, tenantId),
      eq(tenantModules.enabled, true)
    ),
  });

  // Map to module definitions
  const activeModules = activeModuleRecords
    .map((record) => AVAILABLE_MODULES[record.moduleId])
    .filter((module) => module !== undefined);

  return activeModules;
}

export async function activateModule(tenantId: string, moduleId: string): Promise<void> {
  const { db } = await import("@/db");
  const { tenantModules } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Check if module exists in registry
  if (!AVAILABLE_MODULES[moduleId]) {
    throw new Error(`Module ${moduleId} not found in registry`);
  }

  // Check if module entry exists
  const existingModule = await db.query.tenantModules.findFirst({
    where: and(
      eq(tenantModules.tenantId, tenantId),
      eq(tenantModules.moduleId, moduleId)
    ),
  });

  if (existingModule) {
    // Update existing entry
    await db
      .update(tenantModules)
      .set({ enabled: true })
      .where(and(
        eq(tenantModules.tenantId, tenantId),
        eq(tenantModules.moduleId, moduleId)
      ));
  } else {
    // Create new entry
    await db.insert(tenantModules).values({
      tenantId,
      moduleId,
      enabled: true,
    });
  }
}

export async function deactivateModule(tenantId: string, moduleId: string): Promise<void> {
  const { db } = await import("@/db");
  const { tenantModules } = await import("@/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Update module to disabled
  await db
    .update(tenantModules)
    .set({ enabled: false })
    .where(and(
      eq(tenantModules.tenantId, tenantId),
      eq(tenantModules.moduleId, moduleId)
    ));
}
