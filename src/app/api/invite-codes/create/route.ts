import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createInviteCode } from "@/lib/invite-codes";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tenantId, moduleId, role, maxUses, expiresAt, createdBy } = body;

    if (!tenantId || !createdBy) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const code = await createInviteCode({
      tenantId,
      moduleId: moduleId || null,
      role: role || "member",
      maxUses: maxUses || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy,
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Error creating invite code:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du code" },
      { status: 500 }
    );
  }
}
