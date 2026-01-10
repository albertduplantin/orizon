import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { volunteers, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH - Update volunteer status (approve/reject)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ volunteerId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { volunteerId } = await params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
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

    // Check if current user has permission (member of tenant with clearance >= 3)
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
        eq(tenantMembers.tenantId, volunteer.tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member || member.clearanceLevel < 3) {
      return NextResponse.json(
        { error: "Permission insuffisante (clearance YELLOW minimum requise)" },
        { status: 403 }
      );
    }

    // Update volunteer status
    const result = await db
      .update(volunteers)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(volunteers.id, volunteerId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Échec de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      volunteer: result[0],
    });
  } catch (error) {
    console.error("Error updating volunteer status:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
