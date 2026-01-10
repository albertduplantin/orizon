import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, tenantMembers, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({
        error: "Not authenticated",
      }, { status: 401 });
    }

    // Check DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
      with: {
        tenantMembers: {
          with: {
            tenant: true,
          },
        },
      },
    });

    // Get all tenants the user is member of
    const userTenants = dbUser?.tenantMembers.map(tm => ({
      tenantId: tm.tenantId,
      tenantName: tm.tenant.name,
      tenantSlug: tm.tenant.slug,
      role: tm.role,
      clearanceLevel: tm.clearanceLevel,
    })) || [];

    return NextResponse.json({
      clerk: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      database: {
        exists: !!dbUser,
        userId: dbUser?.id,
        email: dbUser?.email,
        name: dbUser?.name,
        tenantsCount: dbUser?.tenantMembers.length || 0,
        tenants: userTenants,
      },
      redirectLogic: {
        shouldRedirectToOnboarding: !dbUser || dbUser.tenantMembers.length === 0,
        targetUrl: dbUser && dbUser.tenantMembers.length > 0
          ? `/dashboard/${dbUser.tenantMembers[0].tenant.slug}`
          : "/onboarding",
      },
    });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
