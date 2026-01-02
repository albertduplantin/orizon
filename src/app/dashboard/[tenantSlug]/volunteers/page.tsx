import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      members: {
        where: {
          user: {
            clerkId: user.id,
          },
        },
      },
      volunteers: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      volunteerMissions: {
        include: {
          _count: {
            select: {
              assignments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!tenant || tenant.members.length === 0) {
    redirect("/dashboard");
  }

  const pendingVolunteers = tenant.volunteers.filter((v) => v.status === "pending");
  const approvedVolunteers = tenant.volunteers.filter((v) => v.status === "approved");

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

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total bénévoles</h3>
            <p className="text-3xl font-bold">{tenant.volunteers.length}</p>
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
            <p className="text-3xl font-bold">{tenant.volunteerMissions.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Volunteers List */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Bénévoles récents</h2>
            {tenant.volunteers.length === 0 ? (
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
                {tenant.volunteers.slice(0, 5).map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="p-4 border rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {volunteer.user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium">{volunteer.user.name || "Sans nom"}</p>
                          <p className="text-sm text-muted-foreground">{volunteer.user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          volunteer.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : volunteer.status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {volunteer.status === "approved"
                          ? "Approuvé"
                          : volunteer.status === "pending"
                          ? "En attente"
                          : "Rejeté"}
                      </span>
                    </div>
                  </div>
                ))}
                {tenant.volunteers.length > 5 && (
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
            {tenant.volunteerMissions.length === 0 ? (
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
                {tenant.volunteerMissions.slice(0, 5).map((mission) => (
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
                {tenant.volunteerMissions.length > 5 && (
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
