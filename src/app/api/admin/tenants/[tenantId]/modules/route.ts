import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";
import { activateModule, deactivateModule, getActiveModules, AVAILABLE_MODULES } from "@/lib/modules";

// GET - Récupérer tous les modules avec leur statut pour un tenant
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId } = await params;

    // Get active modules for this tenant
    const activeModules = await getActiveModules(tenantId);
    const activeModuleIds = new Set(activeModules.map(m => m.id));

    // Build response with all available modules and their status
    const modulesWithStatus = Object.values(AVAILABLE_MODULES).map(module => ({
      ...module,
      enabled: activeModuleIds.has(module.id),
    }));

    return NextResponse.json({ modules: modulesWithStatus });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des modules" },
      { status: 500 }
    );
  }
}

// PUT - Activer ou désactiver un module pour un tenant
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { tenantId } = await params;
    const body = await req.json();
    const { moduleId, enabled } = body;

    if (!moduleId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // Check if module exists
    if (!AVAILABLE_MODULES[moduleId]) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Activate or deactivate module
    if (enabled) {
      await activateModule(tenantId, moduleId);
    } else {
      await deactivateModule(tenantId, moduleId);
    }

    return NextResponse.json({
      success: true,
      message: `Module ${enabled ? "activé" : "désactivé"} avec succès`,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du module" },
      { status: 500 }
    );
  }
}
