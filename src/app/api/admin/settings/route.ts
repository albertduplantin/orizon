import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";

// GET - Récupérer les paramètres
export async function GET() {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Pour l'instant, on retourne des valeurs par défaut
    // TODO: Stocker ces paramètres en base de données
    const settings = {
      // Général
      platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME || "ORIZON",
      supportEmail: process.env.SUPPORT_EMAIL || "support@orizon.com",
      maxTenantsPerUser: 5,

      // Modules
      enableCommunication: true,
      enableVolunteers: true,
      enableSchedule: true,
      enableDocuments: true,
      enableAnalytics: true,

      // Limites
      maxMembersPerTenant: 100,
      maxChannelsPerTenant: 50,
      maxMessagesPerDay: 1000,
      maxStoragePerTenantMB: 1000,

      // Invitations
      inviteCodeExpirationDays: 30,
      maxInviteCodesPerTenant: 10,

      // Sécurité
      requireEmailVerification: true,
      enableTwoFactor: false,
      sessionTimeoutMinutes: 60,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(req: Request) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // TODO: Valider les données
    // TODO: Sauvegarder en base de données
    // Pour l'instant, on simule juste une sauvegarde réussie

    console.log("Settings updated (simulated):", body);

    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès"
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 }
    );
  }
}
