// Invitation Code System - 6 letter codes

import { prisma } from "./db";

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
  let code = generateInviteCode();

  // Ensure code is unique
  let existing = await prisma.inviteCode.findUnique({ where: { code } });
  while (existing) {
    code = generateInviteCode();
    existing = await prisma.inviteCode.findUnique({ where: { code } });
  }

  // Create the invite code in database
  await prisma.inviteCode.create({
    data: {
      code,
      tenantId: data.tenantId,
      moduleId: data.moduleId,
      role: data.role,
      maxUses: data.maxUses || 1,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
    },
  });

  return code;
}

export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  tenantId?: string;
  moduleId?: string;
  role?: string;
  inviteCodeId?: string;
}> {
  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!inviteCode) {
    return { valid: false };
  }

  // Check if expired
  if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
    return { valid: false };
  }

  // Check if max uses reached
  if (inviteCode.uses >= inviteCode.maxUses) {
    return { valid: false };
  }

  return {
    valid: true,
    tenantId: inviteCode.tenantId,
    moduleId: inviteCode.moduleId || undefined,
    role: inviteCode.role,
    inviteCodeId: inviteCode.id,
  };
}

export async function useInviteCode(code: string, userId: string): Promise<void> {
  const validation = await validateInviteCode(code);

  if (!validation.valid || !validation.tenantId) {
    throw new Error("Code d'invitation invalide");
  }

  // Increment uses count
  await prisma.inviteCode.update({
    where: { code: code.toUpperCase() },
    data: {
      uses: {
        increment: 1,
      },
    },
  });

  // Add user to tenant
  await prisma.tenantMember.create({
    data: {
      tenantId: validation.tenantId,
      userId,
      role: validation.role,
    },
  });

  // If it's for volunteers module, create volunteer entry
  if (validation.moduleId === "volunteers") {
    await prisma.volunteer.create({
      data: {
        tenantId: validation.tenantId,
        userId,
        status: "pending",
      },
    });
  }
}
