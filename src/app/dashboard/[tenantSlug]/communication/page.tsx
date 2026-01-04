import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, tenants, channelMembers, channels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CommunicationClient } from "./client";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function CommunicationPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { tenantSlug } = await params;

  // Get user
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) redirect("/sign-in");

  // Get tenant
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) redirect("/dashboard");

  // Get user's channels for this tenant
  const userChannelMemberships = await db.query.channelMembers.findMany({
    where: and(
      eq(channelMembers.userId, dbUser.id),
      eq(channelMembers.tenantId, tenant.id)
    ),
    with: {
      channel: true,
    },
  });

  const userChannels = userChannelMemberships.map(m => m.channel);

  // If no channels, show empty state
  if (userChannels.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Aucun channel disponible</h2>
          <p className="text-muted-foreground mb-4">
            Le module Communication est activé mais aucun channel n'a été créé.
          </p>
          <p className="text-sm text-muted-foreground">
            Contactez un administrateur pour créer des channels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CommunicationClient
      channels={userChannels}
      userId={dbUser.id}
      tenantId={tenant.id}
    />
  );
}
