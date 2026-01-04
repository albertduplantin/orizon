import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, channelMembers, unreadCounts, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = content.matchAll(mentionRegex);
  return Array.from(matches, m => m[1]);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { channelId, content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Contenu requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre du channel
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const membership = await db.query.channelMembers.findFirst({
      where: and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.userId, dbUser.id)
      ),
      with: {
        channel: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Non autorisé - pas membre du channel" },
        { status: 403 }
      );
    }

    // Extraire les mentions
    const mentions = extractMentions(content);

    // Créer le message
    const [message] = await db.insert(messages).values({
      channelId,
      tenantId: membership.channel.tenantId,
      userId: dbUser.id,
      content: content.trim(),
      mentions,
    }).returning();

    // Incrémenter les unread counts pour tous les autres membres
    const otherMembers = await db.query.channelMembers.findMany({
      where: and(
        eq(channelMembers.channelId, channelId),
        sql`${channelMembers.userId} != ${dbUser.id}`
      ),
    });

    for (const member of otherMembers) {
      const isMentioned = mentions.includes(member.userId);

      await db.insert(unreadCounts)
        .values({
          userId: member.userId,
          channelId,
          tenantId: membership.channel.tenantId,
          count: 1,
          mentionCount: isMentioned ? 1 : 0,
          lastMessageAt: message.createdAt,
        })
        .onConflictDoUpdate({
          target: [unreadCounts.userId, unreadCounts.channelId],
          set: {
            count: sql`${unreadCounts.count} + 1`,
            mentionCount: isMentioned
              ? sql`${unreadCounts.mentionCount} + 1`
              : unreadCounts.mentionCount,
            lastMessageAt: message.createdAt,
            updatedAt: new Date(),
          },
        });
    }

    // Le WebSocket Supabase notifiera automatiquement les clients
    // grâce à la subscription postgres_changes

    // Retourner le message avec les infos utilisateur
    return NextResponse.json({
      message: {
        ...message,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          image: dbUser.image,
        },
      },
    });
  } catch (error) {
    console.error("Erreur envoi message:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
