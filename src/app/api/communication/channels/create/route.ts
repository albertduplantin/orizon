import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { channels, channelMembers, messages, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SYSTEM_ROLES } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { tenantId, name, description, type, moduleId } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nom du channel requis" },
        { status: 400 }
      );
    }

    // Vérifier permissions
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier permission de création
    const userPermissions = SYSTEM_ROLES[member.role as keyof typeof SYSTEM_ROLES] || [];
    const canCreate = userPermissions.includes("*") ||
                     userPermissions.includes("communication.channels.create");

    if (!canCreate) {
      return NextResponse.json(
        { error: "Permission insuffisante" },
        { status: 403 }
      );
    }

    // Créer slug unique
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Créer le channel
    const [channel] = await db.insert(channels).values({
      tenantId,
      name: name.trim(),
      slug: `${moduleId ? moduleId + '-' : ''}${slug}`,
      description: description?.trim() || null,
      type: type || 'public',
      moduleId: moduleId || null,
      createdBy: dbUser.id,
    }).returning();

    // Ajouter le créateur comme admin
    await db.insert(channelMembers).values({
      channelId: channel.id,
      userId: dbUser.id,
      tenantId,
      role: 'admin',
    });

    // Message système
    await db.insert(messages).values({
      channelId: channel.id,
      tenantId,
      userId: dbUser.id,
      type: 'system',
      content: `Channel **${name}** créé par ${dbUser.name || 'un utilisateur'}`,
    });

    return NextResponse.json({ channel });
  } catch (error) {
    console.error("Erreur création channel:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
