// Dynamic Module Loading System
// Loads modules on-demand based on user's clearance level and tenant configuration

import { type ComponentType } from "react";
import { type ModuleDefinition } from "./modules";

export interface ModuleComponent {
  default: ComponentType<any>;
}

/**
 * Module loaders - Use dynamic imports for code splitting
 * Each module is loaded only when needed
 */
export const MODULE_LOADERS: Record<string, () => Promise<ModuleComponent>> = {
  // Core modules (always loaded)
  communication: () =>
    import("@/modules/communication").then((mod) => ({ default: mod.CommunicationModule })),

  // Optional modules (loaded on demand)
  volunteers: () =>
    import("@/modules/volunteers").then((mod) => ({ default: mod.VolunteersModule })),

  ticketing: () =>
    import("@/modules/ticketing").then((mod) => ({ default: mod.TicketingModule })),

  schedule: () =>
    import("@/modules/schedule").then((mod) => ({ default: mod.ScheduleModule })),

  documents: () =>
    import("@/modules/documents").then((mod) => ({ default: mod.DocumentsModule })),

  analytics: () =>
    import("@/modules/analytics").then((mod) => ({ default: mod.AnalyticsModule })),
};

/**
 * Load a single module dynamically
 */
export async function loadModule(moduleId: string): Promise<ComponentType<any> | null> {
  const loader = MODULE_LOADERS[moduleId];

  if (!loader) {
    console.warn(`No loader found for module: ${moduleId}`);
    return null;
  }

  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load module ${moduleId}:`, error);
    return null;
  }
}

/**
 * Load multiple modules in parallel
 */
export async function loadModules(
  modules: ModuleDefinition[]
): Promise<Record<string, ComponentType<any>>> {
  const loadPromises = modules.map(async (module) => {
    const component = await loadModule(module.id);
    return { id: module.id, component };
  });

  const results = await Promise.all(loadPromises);

  return results.reduce(
    (acc, { id, component }) => {
      if (component) {
        acc[id] = component;
      }
      return acc;
    },
    {} as Record<string, ComponentType<any>>
  );
}

/**
 * Preload modules for better performance
 * Call this when user is likely to need a module soon
 */
export function preloadModule(moduleId: string): void {
  const loader = MODULE_LOADERS[moduleId];
  if (loader) {
    loader().catch((error) => {
      console.warn(`Failed to preload module ${moduleId}:`, error);
    });
  }
}

/**
 * Preload multiple modules
 */
export function preloadModules(moduleIds: string[]): void {
  moduleIds.forEach(preloadModule);
}

/**
 * Get module route path
 */
export function getModuleRoute(tenantSlug: string, moduleId: string): string {
  const routeMap: Record<string, string> = {
    communication: `/dashboard/${tenantSlug}/communication`,
    volunteers: `/dashboard/${tenantSlug}/volunteers`,
    ticketing: `/dashboard/${tenantSlug}/ticketing`,
    schedule: `/dashboard/${tenantSlug}/schedule`,
    documents: `/dashboard/${tenantSlug}/documents`,
    analytics: `/dashboard/${tenantSlug}/analytics`,
  };

  return routeMap[moduleId] || `/dashboard/${tenantSlug}`;
}

/**
 * Check if module is available for lazy loading
 */
export function hasModuleLoader(moduleId: string): boolean {
  return moduleId in MODULE_LOADERS;
}
