import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { channels, channelMembers, messages, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Test endpoint to verify Communication module setup
 * GET /api/communication/test?tenantId=xxx
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId requis" },
        { status: 400 }
      );
    }

    // Get user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Get all channels for tenant
    const tenantChannels = await db.query.channels.findMany({
      where: eq(channels.tenantId, tenantId),
      with: {
        members: {
          where: eq(channelMembers.userId, dbUser.id),
        },
      },
    });

    // Get user's channel memberships
    const userChannelIds = tenantChannels
      .filter(c => c.members.length > 0)
      .map(c => c.id);

    // Get sample messages for each channel
    const channelMessages: Record<string, any[]> = {};
    for (const channelId of userChannelIds) {
      const msgs = await db.query.messages.findMany({
        where: eq(messages.channelId, channelId),
        limit: 5,
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
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
      channelMessages[channelId] = msgs;
    }

    return NextResponse.json({
      success: true,
      userId: dbUser.id,
      userName: dbUser.name,
      tenantId,
      channels: {
        total: tenantChannels.length,
        userIsMemberOf: userChannelIds.length,
        list: tenantChannels.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          type: c.type,
          description: c.description,
          moduleId: c.moduleId,
          isMember: c.members.length > 0,
          memberRole: c.members[0]?.role || null,
          messagesCount: channelMessages[c.id]?.length || 0,
          sampleMessages: channelMessages[c.id] || [],
        })),
      },
      instructions: {
        createChannel: "POST /api/communication/channels/create",
        sendMessage: "POST /api/communication/messages/send",
        getMessages: "GET /api/communication/messages/[channelId]",
      },
    });
  } catch (error) {
    console.error("Erreur test communication:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
