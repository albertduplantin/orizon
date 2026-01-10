import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({
        error: "Not authenticated",
      }, { status: 401 });
    }

    // Get DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({
        error: "User not found in database",
      }, { status: 404 });
    }

    // Update all tenant_admin memberships to have BLUE clearance (5)
    const result = await db
      .update(tenantMembers)
      .set({
        clearanceLevel: 5, // BLUE - Tenant admin level
      })
      .where(
        and(
          eq(tenantMembers.userId, dbUser.id),
          eq(tenantMembers.role, "tenant_admin")
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: `Updated ${result.length} tenant memberships to BLUE clearance (level 5)`,
      updatedMemberships: result.map(m => ({
        tenantId: m.tenantId,
        role: m.role,
        clearanceLevel: m.clearanceLevel,
      })),
    });
  } catch (error) {
    console.error("Fix clearance error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
