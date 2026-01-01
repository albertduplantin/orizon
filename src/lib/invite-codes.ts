// Invitation Code System - 6 letter codes

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude I, O, 0, 1 to avoid confusion

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  return code;
}

export async function createInviteCode(data: {
  tenantId: string;
  moduleId: string | null;
  role: string;
  maxUses?: number;
  expiresAt?: Date;
  createdBy: string;
}): Promise<string> {
  // TODO: Implement database creation
  // For now, just generate a code
  const code = generateInviteCode();
  console.log("Generated invite code:", code, data);
  return code;
}

export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  tenantId?: string;
  moduleId?: string;
  role?: string;
}> {
  // TODO: Implement database validation
  return {
    valid: false,
  };
}

export async function useInviteCode(code: string, userId: string): Promise<void> {
  // TODO: Implement invite code usage
  console.log(`User ${userId} used invite code ${code}`);
}
