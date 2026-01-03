import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, channelMembers, users } from "@/db/schema";
import { eq, and, lt, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { channelId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Vérifier membership
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
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Pagination cursor-based
    const query = cursor
      ? db.query.messages.findMany({
          where: and(
            eq(messages.channelId, channelId),
            lt(messages.createdAt, new Date(cursor))
          ),
          orderBy: [desc(messages.createdAt)],
          limit,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        })
      : db.query.messages.findMany({
          where: eq(messages.channelId, channelId),
          orderBy: [desc(messages.createdAt)],
          limit,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

    const results = await query;

    return NextResponse.json({
      messages: results,
      nextCursor: results.length === limit
        ? results[results.length - 1].createdAt.toISOString()
        : null,
    });
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
