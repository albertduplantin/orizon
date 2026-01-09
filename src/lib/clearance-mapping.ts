// Rainbow Clearance System - Role Mapping

export const CLEARANCE_LEVELS = {
  INFRARED: 0,
  RED: 1,
  ORANGE: 2,
  YELLOW: 3,
  GREEN: 4,
  BLUE: 5,
  ULTRAVIOLET: 6,
} as const;

export const CLEARANCE_NAMES = {
  0: 'INFRARED',
  1: 'RED',
  2: 'ORANGE',
  3: 'YELLOW',
  4: 'GREEN',
  5: 'BLUE',
  6: 'ULTRAVIOLET',
} as const;

export const CLEARANCE_COLORS = {
  0: '#000000', // Black
  1: '#ef4444', // Red
  2: '#f97316', // Orange
  3: '#eab308', // Yellow
  4: '#22c55e', // Green
  5: '#3b82f6', // Blue
  6: '#a855f7', // Purple/Violet
} as const;

// Default clearance mapping for common roles
export const ROLE_TO_CLEARANCE: Record<string, number> = {
  'public': CLEARANCE_LEVELS.INFRARED,
  'participant': CLEARANCE_LEVELS.RED,
  'member': CLEARANCE_LEVELS.RED,
  'volunteer': CLEARANCE_LEVELS.ORANGE,
  'coordinator': CLEARANCE_LEVELS.YELLOW,
  'team_lead': CLEARANCE_LEVELS.YELLOW,
  'module_manager': CLEARANCE_LEVELS.GREEN,
  'ca_member': CLEARANCE_LEVELS.BLUE, // Conseil d'Administration
  'bureau_member': CLEARANCE_LEVELS.BLUE, // Bureau
  'tenant_admin': CLEARANCE_LEVELS.BLUE,
  'president': CLEARANCE_LEVELS.ULTRAVIOLET,
  'super_admin': CLEARANCE_LEVELS.ULTRAVIOLET,
};

// Association-specific role descriptions
export const ASSOCIATION_ROLES = {
  volunteer: {
    name: 'Bénévole',
    clearance: CLEARANCE_LEVELS.ORANGE,
    description: 'Participe aux missions et événements',
  },
  coordinator: {
    name: 'Coordinateur',
    clearance: CLEARANCE_LEVELS.YELLOW,
    description: 'Coordonne une équipe ou un pôle',
  },
  module_manager: {
    name: 'Responsable de pôle',
    clearance: CLEARANCE_LEVELS.GREEN,
    description: 'Gère un pôle (logistique, communication, etc.)',
  },
  ca_member: {
    name: 'Membre CA',
    clearance: CLEARANCE_LEVELS.BLUE,
    description: 'Membre du Conseil d\'Administration',
  },
  bureau_member: {
    name: 'Membre Bureau',
    clearance: CLEARANCE_LEVELS.BLUE,
    description: 'Membre du Bureau de l\'association',
  },
  president: {
    name: 'Président',
    clearance: CLEARANCE_LEVELS.ULTRAVIOLET,
    description: 'Président de l\'association',
  },
} as const;

export function getClearanceForRole(role: string): number {
  return ROLE_TO_CLEARANCE[role] ?? CLEARANCE_LEVELS.RED;
}

export function getClearanceName(level: number): string {
  return CLEARANCE_NAMES[level as keyof typeof CLEARANCE_NAMES] ?? 'UNKNOWN';
}

export function getClearanceColor(level: number): string {
  return CLEARANCE_COLORS[level as keyof typeof CLEARANCE_COLORS] ?? '#9ca3af';
}

export function getRoleDescription(role: string): string {
  const roleKey = role as keyof typeof ASSOCIATION_ROLES;
  return ASSOCIATION_ROLES[roleKey]?.description ?? 'Membre de l\'association';
}
