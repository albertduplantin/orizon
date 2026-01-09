// Invitation Code System - 6 letter codes

import { db } from "@/db";
import { inviteCodes, tenantMembers, volunteers, memberProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail, invitationEmailTemplate } from "./email";
import { getClearanceForRole, getClearanceName } from "./clearance-mapping";

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
  email?: string; // Optional: send invitation email
}): Promise<string> {
  let code = generateInviteCode();

  // Ensure code is unique
  let existing = await db.query.inviteCodes.findFirst({
    where: eq(inviteCodes.code, code),
  });
  while (existing) {
    code = generateInviteCode();
    existing = await db.query.inviteCodes.findFirst({
      where: eq(inviteCodes.code, code),
    });
  }

  // Create the invite code in database
  await db.insert(inviteCodes).values({
    code,
    tenantId: data.tenantId,
    moduleId: data.moduleId,
    role: data.role,
    maxUses: data.maxUses || 1,
    expiresAt: data.expiresAt,
    createdBy: data.createdBy,
  });

  // Send invitation email if email provided
  if (data.email) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(inviteCodes.tenantId, data.tenantId),
    });

    if (tenant) {
      const clearanceLevel = getClearanceForRole(data.role);
      const clearanceName = getClearanceName(clearanceLevel);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/join/${code}`;

      await sendEmail({
        to: data.email,
        subject: `Invitation à rejoindre ${tenant.name}`,
        html: invitationEmailTemplate({
          tenantName: tenant.name,
          inviteLink,
          role: data.role,
          clearanceLevel,
          clearanceName,
          expiresAt: data.expiresAt,
        }),
      });
    }
  }

  return code;
}

export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  tenantId?: string;
  moduleId?: string;
  role?: string;
  inviteCodeId?: string;
}> {
  const inviteCode = await db.query.inviteCodes.findFirst({
    where: eq(inviteCodes.code, code.toUpperCase()),
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

  // Calculate clearance level from role
  const clearanceLevel = getClearanceForRole(validation.role);

  // Increment uses count
  await db
    .update(inviteCodes)
    .set({
      uses: sql`${inviteCodes.uses} + 1`,
    })
    .where(eq(inviteCodes.code, code.toUpperCase()));

  // Add user to tenant with clearance
  await db.insert(tenantMembers).values({
    tenantId: validation.tenantId,
    userId,
    role: validation.role,
    clearanceLevel, // Auto-assign clearance based on role
  });

  // Create member profile
  await db.insert(memberProfiles).values({
    userId,
    tenantId: validation.tenantId,
    skills: [],
    preferredMissionTypes: [],
  });

  // If it's for volunteers module, create volunteer entry
  if (validation.moduleId === "volunteers") {
    await db.insert(volunteers).values({
      tenantId: validation.tenantId,
      userId,
      status: "pending",
      skills: [],
    });
  }
}
