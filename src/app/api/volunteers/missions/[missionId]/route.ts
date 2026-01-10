import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { volunteerMissions, volunteerAssignments, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get mission details
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

    // Get mission with all details
    const mission = await db.query.volunteerMissions.findFirst({
      where: eq(volunteerMissions.id, missionId),
      with: {
        assignments: {
          with: {
            volunteer: {
              with: {
                user: true,
              },
            },
          },
        },
      },
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

    return NextResponse.json({
      mission,
    });
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la mission" },
      { status: 500 }
    );
  }
}

// PUT - Update mission
export async function PUT(
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
    const {
      title,
      description,
      requiredCount,
      status,
      startDate,
      endDate,
      location,
    } = body;

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

    // Validate status if provided
    if (status) {
      const validStatuses = ["draft", "published", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Statut invalide" },
          { status: 400 }
        );
      }
    }

    // Validate dates if both provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: "La date de début doit être antérieure à la date de fin" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requiredCount !== undefined) updateData.requiredCount = requiredCount;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (location !== undefined) updateData.location = location;

    // Update mission
    const result = await db
      .update(volunteerMissions)
      .set(updateData)
      .where(eq(volunteerMissions.id, missionId))
      .returning();

    return NextResponse.json({
      success: true,
      mission: result[0],
    });
  } catch (error) {
    console.error("Error updating mission:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la mission" },
      { status: 500 }
    );
  }
}

// DELETE - Delete mission
export async function DELETE(
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

    // Check clearance level (min GREEN/4 required for deletion)
    if (member.clearanceLevel < 4) {
      return NextResponse.json(
        { error: "Permission insuffisante (clearance GREEN minimum requise)" },
        { status: 403 }
      );
    }

    // Prevent deletion if mission has active assignments
    if (mission.assignments.length > 0 && mission.status !== "cancelled") {
      return NextResponse.json(
        { error: "Impossible de supprimer une mission avec des bénévoles assignés. Annulez d'abord la mission." },
        { status: 400 }
      );
    }

    // Delete mission (cascade will delete assignments)
    await db
      .delete(volunteerMissions)
      .where(eq(volunteerMissions.id, missionId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting mission:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la mission" },
      { status: 500 }
    );
  }
}
