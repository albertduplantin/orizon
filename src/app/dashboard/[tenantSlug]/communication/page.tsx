import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, tenants, channelMembers, channels, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CommunicationClient } from "./client";
import Link from "next/link";
import { CreateChannelDialog } from "@/components/communication/create-channel-dialog";

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

  // Check if user is tenant admin (for create channel permission)
  const member = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.tenantId, tenant.id),
      eq(tenantMembers.userId, dbUser.id)
    ),
  });

  const canCreateChannels = member?.role === "tenant_admin";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Aucun channel disponible</h2>
              <p className="text-muted-foreground mb-4">
                Le module Communication est activé mais aucun channel n'a été créé.
              </p>
              <p className="text-sm text-muted-foreground">
                Contactez un administrateur pour créer des channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-foreground">
              {tenant.name}
            </Link>
            <span>/</span>
            <span>Communication</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Communication</h1>
            {canCreateChannels && (
              <CreateChannelDialog tenantId={tenant.id} />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="glass-card rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <CommunicationClient
            channels={userChannels}
            userId={dbUser.id}
            userName={dbUser.name || 'Utilisateur'}
            tenantId={tenant.id}
          />
        </div>
      </div>
    </div>
  );
}
