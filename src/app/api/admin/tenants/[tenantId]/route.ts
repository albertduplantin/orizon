import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, tenantMembers, tenantModules, messages, channels, volunteers, volunteerMissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/admin/auth";

// DELETE - Supprimer un tenant et toutes ses données
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    // Vérifier que l'utilisateur est super admin
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId } = await params;

    // Supprimer toutes les données associées au tenant
    // L'ordre est important à cause des contraintes de clés étrangères
    await db.delete(volunteerMissions).where(eq(volunteerMissions.tenantId, tenantId));
    await db.delete(volunteers).where(eq(volunteers.tenantId, tenantId));
    await db.delete(messages).where(eq(messages.tenantId, tenantId));
    await db.delete(channels).where(eq(channels.tenantId, tenantId));
    await db.delete(tenantModules).where(eq(tenantModules.tenantId, tenantId));
    await db.delete(tenantMembers).where(eq(tenantMembers.tenantId, tenantId));

    // Enfin, supprimer le tenant lui-même
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un tenant
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    // Vérifier que l'utilisateur est super admin
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId } = await params;
    const body = await req.json();

    const { name, description, eventStartDate, eventEndDate } = body;

    const result = await db
      .update(tenants)
      .set({
        name,
        description,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Tenant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant: result[0] });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
