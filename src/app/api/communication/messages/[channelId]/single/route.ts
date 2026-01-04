import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, channelMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/communication/messages/[channelId]/single?messageId=xxx
 * Récupère un message unique avec les informations utilisateur
 * Utilisé par le realtime pour obtenir les infos complètes d'un nouveau message
 */
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
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId requis" },
        { status: 400 }
      );
    }

    // Vérifier membership
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const membership = await db.query.channelMembers.findFirst({
      where: and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.userId, dbUser.id)
      ),
    });

    if (!membership) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer le message avec les infos utilisateur
    const message = await db.query.messages.findFirst({
      where: and(
        eq(messages.id, messageId),
        eq(messages.channelId, channelId)
      ),
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

    if (!message) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Erreur récupération message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
