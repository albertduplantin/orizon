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
  // TODO: Query database for active modules for this tenant
  // For now, return all available modules
  return Object.values(AVAILABLE_MODULES);
}

export async function activateModule(tenantId: string, moduleId: string): Promise<void> {
  // TODO: Activate module for tenant
  console.log(`Activating module ${moduleId} for tenant ${tenantId}`);
}

export async function deactivateModule(tenantId: string, moduleId: string): Promise<void> {
  // TODO: Deactivate module for tenant
  console.log(`Deactivating module ${moduleId} for tenant ${tenantId}`);
}
