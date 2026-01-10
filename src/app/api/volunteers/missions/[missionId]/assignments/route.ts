import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { volunteerAssignments, volunteerMissions, volunteers, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST - Assign volunteer to mission
export async function POST(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { missionId } = await params;
    const body = await req.json();
    const { volunteerId, roleId, notes } = body;

    if (!volunteerId) {
      return NextResponse.json(
        { error: "volunteerId requis" },
        { status: 400 }
      );
    }

    // Get mission
    const mission = await db.query.volunteerMissions.findFirst({
      where: eq(volunteerMissions.id, missionId),
      with: {
        assignments: true,
      },
    });

    if (!mission) {
      return NextResponse.json(
        { error: "Mission non trouvée" },
        { status: 404 }
      );
    }

    // Check if mission is published or in progress
    if (mission.status === "draft" || mission.status === "cancelled") {
      return NextResponse.json(
        { error: "Impossible d'assigner des bénévoles à une mission en brouillon ou annulée" },
        { status: 400 }
      );
    }

    // Get volunteer
    const volunteer = await db.query.volunteers.findFirst({
      where: eq(volunteers.id, volunteerId),
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Bénévole non trouvé" },
        { status: 404 }
      );
    }

    // Verify volunteer belongs to same tenant
    if (volunteer.tenantId !== mission.tenantId) {
      return NextResponse.json(
        { error: "Le bénévole n'appartient pas au même événement" },
        { status: 400 }
      );
    }

    // Verify volunteer is approved
    if (volunteer.status !== "approved") {
      return NextResponse.json(
        { error: "Le bénévole doit être approuvé avant d'être assigné" },
        { status: 400 }
      );
    }

    // Check if mission is full
    if (mission.assignments.length >= mission.requiredCount) {
      return NextResponse.json(
        { error: "La mission a atteint le nombre maximum de bénévoles" },
        { status: 400 }
      );
    }

    // Check if volunteer is already assigned
    const existingAssignment = await db.query.volunteerAssignments.findFirst({
      where: and(
        eq(volunteerAssignments.volunteerId, volunteerId),
        eq(volunteerAssignments.missionId, missionId)
      ),
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Ce bénévole est déjà assigné à cette mission" },
        { status: 400 }
      );
    }

    // Get user and check permissions
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, mission.tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Check clearance level (min YELLOW/3 required)
    if (member.clearanceLevel < 3) {
      return NextResponse.json(
        { error: "Permission insuffisante (clearance YELLOW minimum requise)" },
        { status: 403 }
      );
    }

    // Create assignment
    const result = await db
      .insert(volunteerAssignments)
      .values({
        tenantId: mission.tenantId,
        volunteerId,
        missionId,
        roleId: roleId || null,
        status: "assigned",
        notes: notes || null,
      })
      .returning();

    // Update mission status to in_progress if it was published
    if (mission.status === "published") {
      await db
        .update(volunteerMissions)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(volunteerMissions.id, missionId));
    }

    return NextResponse.json({
      success: true,
      assignment: result[0],
    });
  } catch (error) {
    console.error("Error assigning volunteer:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'assignation du bénévole" },
      { status: 500 }
    );
  }
}

// GET - List assignments for a mission
export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { missionId } = await params;

    // Get mission
    const mission = await db.query.volunteerMissions.findFirst({
      where: eq(volunteerMissions.id, missionId),
    });

    if (!mission) {
      return NextResponse.json(
        { error: "Mission non trouvée" },
        { status: 404 }
      );
    }

    // Check if user is a member of the tenant
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, mission.tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Get assignments
    const assignments = await db.query.volunteerAssignments.findMany({
      where: eq(volunteerAssignments.missionId, missionId),
      with: {
        volunteer: {
          with: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assignations" },
      { status: 500 }
    );
  }
}
