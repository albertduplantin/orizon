import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants, tenantMembers, users, volunteers, volunteerMissions, volunteerAssignments } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VolunteerCard } from "@/components/volunteers/volunteer-card";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function VolunteersPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  // Get tenant and check access
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

  // Get volunteers with user data
  const tenantVolunteers = await db.query.volunteers.findMany({
    where: eq(volunteers.tenantId, tenant.id),
    with: {
      user: true,
    },
    orderBy: [desc(volunteers.createdAt)],
  });

  // Get volunteer missions with assignment counts
  const missions = await db.query.volunteerMissions.findMany({
    where: eq(volunteerMissions.tenantId, tenant.id),
    orderBy: [desc(volunteerMissions.createdAt)],
  });

  // Get assignment counts for each mission
  const missionsWithCounts = await Promise.all(
    missions.map(async (mission) => {
      const [assignmentCount] = await db
        .select({ count: count() })
        .from(volunteerAssignments)
        .where(eq(volunteerAssignments.missionId, mission.id));

      return {
        ...mission,
        _count: {
          assignments: assignmentCount?.count || 0,
        },
      };
    })
  );

  const pendingVolunteers = tenantVolunteers.filter((v) => v.status === "pending");
  const approvedVolunteers = tenantVolunteers.filter((v) => v.status === "approved");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-foreground">
              {tenant.name}
            </Link>
            <span>/</span>
            <span>Bénévoles</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestion des Bénévoles</h1>
            <div className="flex gap-2">
              <Link href={`/dashboard/${tenantSlug}/volunteers/missions/new`}>
                <Button variant="outline">+ Nouvelle mission</Button>
              </Link>
              <Link href={`/dashboard/${tenantSlug}/volunteers/invite`}>
                <Button>+ Inviter des bénévoles</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Volunteers Alert */}
        {pendingVolunteers.length > 0 && (
          <div className="glass-card p-6 rounded-xl mb-8 border-l-4 border-orange-500">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  {pendingVolunteers.length} bénévole{pendingVolunteers.length > 1 ? "s" : ""} en attente d'approbation
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Approuvez ou rejetez les candidatures pour permettre aux bénévoles de participer aux missions.
                </p>
                <div className="space-y-3">
                  {pendingVolunteers.map((volunteer) => (
                    <VolunteerCard key={volunteer.id} volunteer={volunteer} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total bénévoles</h3>
            <p className="text-3xl font-bold">{tenantVolunteers.length}</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Approuvés</h3>
            <p className="text-3xl font-bold text-green-600">{approvedVolunteers.length}</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">En attente</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingVolunteers.length}</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Missions</h3>
            <p className="text-3xl font-bold">{missionsWithCounts.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Volunteers List */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Bénévoles récents</h2>
            {tenantVolunteers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Aucun bénévole pour le moment
                </p>
                <Link href={`/dashboard/${tenantSlug}/volunteers/invite`}>
                  <Button>Inviter des bénévoles</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tenantVolunteers.slice(0, 5).map((volunteer) => (
                  <VolunteerCard
                    key={volunteer.id}
                    volunteer={volunteer}
                  />
                ))}
                {tenantVolunteers.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href={`/dashboard/${tenantSlug}/volunteers/list`}>
                      <Button variant="link">Voir tous les bénévoles</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Missions List */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Missions récentes</h2>
            {missionsWithCounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Aucune mission créée
                </p>
                <Link href={`/dashboard/${tenantSlug}/volunteers/missions/new`}>
                  <Button>Créer une mission</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {missionsWithCounts.slice(0, 5).map((mission) => (
                  <div
                    key={mission.id}
                    className="p-4 border rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{mission.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {mission._count.assignments}/{mission.requiredCount}
                      </span>
                    </div>
                    {mission.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {mission.description}
                      </p>
                    )}
                    {mission.startDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(mission.startDate).toLocaleDateString("fr-FR")}
                        {mission.endDate &&
                          ` - ${new Date(mission.endDate).toLocaleDateString("fr-FR")}`}
                      </p>
                    )}
                  </div>
                ))}
                {missionsWithCounts.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href={`/dashboard/${tenantSlug}/volunteers/missions`}>
                      <Button variant="link">Voir toutes les missions</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
