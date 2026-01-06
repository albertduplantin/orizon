// Rainbow Clearance System
// Security clearance levels from infrared (lowest) to ultraviolet (highest)

export const CLEARANCE_LEVELS = {
  INFRARED: 0, // Public - General event information
  RED: 1, // Participant - Basic member access
  ORANGE: 2, // Volunteer - Mission and planning access
  YELLOW: 3, // Coordinator - Team management
  GREEN: 4, // Module Manager - Statistics and budgets
  BLUE: 5, // Tenant Admin - Full tenant configuration
  ULTRAVIOLET: 6, // Super Admin - Platform-wide access
} as const;

export const CLEARANCE_NAMES = {
  0: "INFRARED",
  1: "RED",
  2: "ORANGE",
  3: "YELLOW",
  4: "GREEN",
  5: "BLUE",
  6: "ULTRAVIOLET",
} as const;

export const CLEARANCE_LABELS = {
  0: "Public",
  1: "Participant",
  2: "Bénévole",
  3: "Coordinateur",
  4: "Responsable Module",
  5: "Administrateur",
  6: "Super Admin",
} as const;

export const CLEARANCE_DESCRIPTIONS = {
  0: "Accès public aux informations générales",
  1: "Accès participant aux informations de base",
  2: "Accès aux missions et planning des bénévoles",
  3: "Gestion d'équipe et coordination",
  4: "Accès aux statistiques et budgets du module",
  5: "Configuration complète de l'événement",
  6: "Accès administrateur plateforme",
} as const;

export const CLEARANCE_COLORS = {
  0: "#000000", // Black (infrared is invisible, so black represents it)
  1: "#EF4444", // Red
  2: "#F97316", // Orange
  3: "#EAB308", // Yellow
  4: "#22C55E", // Green
  5: "#3B82F6", // Blue
  6: "#A855F7", // Purple/Violet
} as const;

export type ClearanceLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ResourceType =
  | "channel"
  | "message"
  | "volunteer_mission"
  | "document"
  | "module"
  | "tenant"
  | "analytics";

/**
 * Check if a user has sufficient clearance to access a resource
 */
export function hasAccess(userClearance: ClearanceLevel, requiredClearance: ClearanceLevel): boolean {
  return userClearance >= requiredClearance;
}

/**
 * Get the clearance level for a given role (backwards compatibility)
 */
export function getClearanceForRole(role: string): ClearanceLevel {
  const roleMap: Record<string, ClearanceLevel> = {
    "public": CLEARANCE_LEVELS.INFRARED,
    "member": CLEARANCE_LEVELS.RED,
    "volunteer": CLEARANCE_LEVELS.ORANGE,
    "coordinator": CLEARANCE_LEVELS.YELLOW,
    "module_manager": CLEARANCE_LEVELS.GREEN,
    "admin": CLEARANCE_LEVELS.BLUE,
    "super_admin": CLEARANCE_LEVELS.ULTRAVIOLET,
  };

  return roleMap[role.toLowerCase()] ?? CLEARANCE_LEVELS.RED;
}

/**
 * Get default clearance for a module
 */
export function getModuleClearance(moduleId: string): ClearanceLevel {
  const moduleDefaults: Record<string, ClearanceLevel> = {
    "communication": CLEARANCE_LEVELS.RED, // Everyone can communicate
    "volunteers": CLEARANCE_LEVELS.ORANGE, // Volunteers and above
    "analytics": CLEARANCE_LEVELS.GREEN, // Module managers and above
    "settings": CLEARANCE_LEVELS.BLUE, // Admins only
  };

  return moduleDefaults[moduleId] ?? CLEARANCE_LEVELS.RED;
}

/**
 * Check if clearance level is valid
 */
export function isValidClearance(level: number): level is ClearanceLevel {
  return level >= 0 && level <= 6 && Number.isInteger(level);
}

/**
 * Get clearance badge color class for UI
 */
export function getClearanceBadgeClass(level: ClearanceLevel): string {
  const classes: Record<ClearanceLevel, string> = {
    0: "bg-gray-900 text-white",
    1: "bg-red-500 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-yellow-500 text-black",
    4: "bg-green-500 text-white",
    5: "bg-blue-500 text-white",
    6: "bg-purple-500 text-white",
  };

  return classes[level];
}
