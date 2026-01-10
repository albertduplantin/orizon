import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants, tenantMembers, users, volunteerMissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { MissionForm } from "@/components/volunteers/mission-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
    missionId: string;
  }>;
}

export default async function EditMissionPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug, missionId } = await params;

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
    redirect(`/dashboard/${tenantSlug}/volunteers/missions`);
  }

  // Get mission
  const mission = await db.query.volunteerMissions.findFirst({
    where: eq(volunteerMissions.id, missionId),
  });

  if (!mission) {
    redirect(`/dashboard/${tenantSlug}/volunteers/missions`);
  }

  // Verify mission belongs to tenant
  if (mission.tenantId !== tenant.id) {
    redirect(`/dashboard/${tenantSlug}/volunteers/missions`);
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
            <Link
              href={`/dashboard/${tenantSlug}/volunteers/missions/${mission.id}`}
              className="hover:text-foreground"
            >
              {mission.title}
            </Link>
            <span>/</span>
            <span>Modifier</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${tenantSlug}/volunteers/missions/${mission.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Modifier la mission</h1>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 rounded-xl">
          <MissionForm
            tenantId={tenant.id}
            tenantSlug={tenantSlug}
            initialData={mission}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
