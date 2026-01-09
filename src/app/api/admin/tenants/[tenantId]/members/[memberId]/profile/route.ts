import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { memberProfiles, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get member profile
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; memberId: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId, memberId } = await params;

    // Get member to find userId
    const member = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.id, memberId),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Get profile
    const profile = await db.query.memberProfiles.findFirst({
      where: and(
        eq(memberProfiles.userId, member.userId),
        eq(memberProfiles.tenantId, tenantId)
      ),
    });

    // If no profile exists, return empty profile structure
    if (!profile) {
      return NextResponse.json({
        profile: {
          userId: member.userId,
          tenantId,
          bio: null,
          skills: [],
          availabilityWeekends: false,
          availabilityEvenings: false,
          availabilitySchoolHolidays: false,
          unavailableDates: null,
          hasDriverLicense: false,
          hasVehicle: false,
          vehicleSeats: null,
          city: null,
          postalCode: null,
          maxTravelDistance: null,
          preferredMissionTypes: [],
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH - Update member profile
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tenantId: string; memberId: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId, memberId } = await params;
    const body = await req.json();

    // Get member to find userId
    const member = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.id, memberId),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Check if profile exists
    const existingProfile = await db.query.memberProfiles.findFirst({
      where: and(
        eq(memberProfiles.userId, member.userId),
        eq(memberProfiles.tenantId, tenantId)
      ),
    });

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await db
        .update(memberProfiles)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(memberProfiles.id, existingProfile.id))
        .returning();
    } else {
      // Create new profile
      result = await db
        .insert(memberProfiles)
        .values({
          userId: member.userId,
          tenantId,
          ...body,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      profile: result[0],
    });
  } catch (error) {
    console.error("Error updating member profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
