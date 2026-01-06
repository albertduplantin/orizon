import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
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
