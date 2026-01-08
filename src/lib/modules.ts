// Module System - Dynamic Module Loader with Core/Optional Split

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
  requiredClearance?: number; // Rainbow clearance level required (0-6)
};

// CORE MODULES - Always available, cannot be disabled
// Communication is a core layer used by all other modules
export const CORE_MODULES: Record<string, ModuleDefinition> = {
  communication: {
    id: "communication",
    name: "Communication",
    description: "Messagerie temps réel et collaboration - Toujours disponible",
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
    requiredClearance: 1, // RED - Participants can communicate
  },
};

// OPTIONAL MODULES - Can be activated/deactivated per tenant
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
    requiredClearance: 2, // ORANGE - Volunteers
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
    requiredClearance: 1, // RED - Participants can buy tickets
  },
  schedule: {
    id: "schedule",
    name: "Planning",
    description: "Gestion des horaires et du planning",
    version: "1.0.0",
    icon: "Calendar",
    category: "organization",
    pricing: {
      free: true,
      tier: "base",
    },
    permissions: ["schedule.view", "schedule.edit", "schedule.manage"],
    requiredClearance: 2, // ORANGE - Volunteers can see schedule
  },
  documents: {
    id: "documents",
    name: "Documents",
    description: "Partage et gestion de documents",
    version: "1.0.0",
    icon: "FileText",
    category: "organization",
    pricing: {
      free: true,
      tier: "base",
    },
    permissions: ["documents.view", "documents.upload", "documents.manage"],
    requiredClearance: 2, // ORANGE - Volunteers
  },
  analytics: {
    id: "analytics",
    name: "Analytiques",
    description: "Statistiques et rapports avancés",
    version: "1.0.0",
    icon: "BarChart3",
    category: "organization",
    pricing: {
      free: false,
      tier: "premium",
    },
    permissions: ["analytics.view", "analytics.export"],
    requiredClearance: 4, // GREEN - Module Managers
  },
  // Add more modules here as they are developed
};

/**
 * Get all modules accessible to a user (Core + Active modules filtered by clearance)
 */
export async function getUserModules(tenantId: string, userClearance: number): Promise<ModuleDefinition[]> {
  // Always include core modules
  const coreModules = Object.values(CORE_MODULES).filter(
    (module) => userClearance >= (module.requiredClearance ?? 0)
  );

  // Get active optional modules
  const activeOptionalModules = await getActiveModules(tenantId);

  // Filter by clearance
  const accessibleOptionalModules = activeOptionalModules.filter(
    (module) => userClearance >= (module.requiredClearance ?? 0)
  );

  return [...coreModules, ...accessibleOptionalModules];
}

/**
 * Get active optional modules for a tenant (excludes core modules)
 */
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

  // Map to module definitions (only optional modules)
  const activeModules = activeModuleRecords
    .map((record) => AVAILABLE_MODULES[record.moduleId])
    .filter((module) => module !== undefined);

  return activeModules;
}

/**
 * Get all modules for a tenant (Core + Active optional modules)
 */
export async function getAllTenantModules(tenantId: string): Promise<ModuleDefinition[]> {
  const coreModules = Object.values(CORE_MODULES);
  const activeOptionalModules = await getActiveModules(tenantId);

  return [...coreModules, ...activeOptionalModules];
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
