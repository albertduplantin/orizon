import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenantMembers, volunteerAssignments, volunteers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isValidClearance } from "@/lib/clearance";

// PATCH - Update member clearance level
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
    const { clearanceLevel } = body;

    // Validate clearance level
    if (typeof clearanceLevel !== "number" || !isValidClearance(clearanceLevel)) {
      return NextResponse.json(
        { error: "Niveau de clearance invalide (doit être entre 0 et 6)" },
        { status: 400 }
      );
    }

    // Update member
    const result = await db
      .update(tenantMembers)
      .set({ clearanceLevel })
      .where(eq(tenantMembers.id, memberId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      member: result[0],
    });
  } catch (error) {
    console.error("Error updating member clearance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from tenant
export async function DELETE(
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

    // First, get the member to find the userId
    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.id, memberId),
        eq(tenantMembers.tenantId, tenantId)
      ),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Delete related volunteer missions first (if member is a volunteer)
    const volunteer = await db.query.volunteers.findFirst({
      where: and(
        eq(volunteers.userId, member.userId),
        eq(volunteers.tenantId, tenantId)
      ),
    });

    if (volunteer) {
      // Delete volunteer assignments first (cascade will handle this, but explicit for clarity)
      await db.delete(volunteerAssignments).where(
        eq(volunteerAssignments.volunteerId, volunteer.id)
      );
      // Delete the volunteer record
      await db.delete(volunteers).where(eq(volunteers.id, volunteer.id));
    }

    // Delete the tenant member relationship
    await db.delete(tenantMembers).where(eq(tenantMembers.id, memberId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
