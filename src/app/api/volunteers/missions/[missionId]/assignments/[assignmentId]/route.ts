import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { volunteerAssignments, volunteerMissions, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE - Remove volunteer from mission
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ missionId: string; assignmentId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { missionId, assignmentId } = await params;

    // Get assignment
    const assignment = await db.query.volunteerAssignments.findFirst({
      where: eq(volunteerAssignments.id, assignmentId),
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignation non trouvée" },
        { status: 404 }
      );
    }

    // Verify assignment belongs to mission
    if (assignment.missionId !== missionId) {
      return NextResponse.json(
        { error: "L'assignation n'appartient pas à cette mission" },
        { status: 400 }
      );
    }

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
        eq(tenantMembers.tenantId, assignment.tenantId),
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

    // Delete assignment
    await db
      .delete(volunteerAssignments)
      .where(eq(volunteerAssignments.id, assignmentId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error removing volunteer assignment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'assignation" },
      { status: 500 }
    );
  }
}

// PATCH - Update assignment status/notes
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ missionId: string; assignmentId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { missionId, assignmentId } = await params;
    const body = await req.json();
    const { status, notes } = body;

    // Get assignment
    const assignment = await db.query.volunteerAssignments.findFirst({
      where: eq(volunteerAssignments.id, assignmentId),
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignation non trouvée" },
        { status: 404 }
      );
    }

    // Verify assignment belongs to mission
    if (assignment.missionId !== missionId) {
      return NextResponse.json(
        { error: "L'assignation n'appartient pas à cette mission" },
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
        eq(tenantMembers.tenantId, assignment.tenantId),
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
      const validStatuses = ["assigned", "confirmed", "completed", "no_show"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Statut invalide" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Update assignment
    const result = await db
      .update(volunteerAssignments)
      .set(updateData)
      .where(eq(volunteerAssignments.id, assignmentId))
      .returning();

    return NextResponse.json({
      success: true,
      assignment: result[0],
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'assignation" },
      { status: 500 }
    );
  }
}
