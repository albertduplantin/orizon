import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants, tenantMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { MissionForm } from "@/components/volunteers/mission-form";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function NewMissionPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    redirect("/dashboard");
  }

  // Check if user is a member
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!dbUser) {
    redirect("/dashboard");
  }

  const member = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.tenantId, tenant.id),
      eq(tenantMembers.userId, dbUser.id)
    ),
  });

  if (!member) {
    redirect("/dashboard");
  }

  // Check clearance level (min YELLOW/3 required)
  if (member.clearanceLevel < 3) {
    redirect(`/dashboard/${tenantSlug}/volunteers`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-foreground">
              {tenant.name}
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/${tenantSlug}/volunteers`}
              className="hover:text-foreground"
            >
              Bénévoles
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/${tenantSlug}/volunteers/missions`}
              className="hover:text-foreground"
            >
              Missions
            </Link>
            <span>/</span>
            <span>Nouvelle mission</span>
          </div>
          <h1 className="text-3xl font-bold">Créer une mission</h1>
          <p className="text-muted-foreground mt-2">
            Définissez une nouvelle mission pour vos bénévoles
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 rounded-xl">
          <MissionForm
            tenantId={tenant.id}
            tenantSlug={tenantSlug}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}
