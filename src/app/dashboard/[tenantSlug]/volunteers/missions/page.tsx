import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants, tenantMembers, users, volunteerMissions, volunteerAssignments } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {Calendar, MapPin, Users, Plus, CheckCircle2, Circle, XCircle, Clock, FileText} from "lucide-react";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

function getStatusBadge(status: string) {
  const badges = {
    draft: {
      icon: FileText,
      label: "Brouillon",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    published: {
      icon: Circle,
      label: "Publiée",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    in_progress: {
      icon: Clock,
      label: "En cours",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    completed: {
      icon: CheckCircle2,
      label: "Terminée",
      className: "bg-green-100 text-green-700 border-green-300",
    },
    cancelled: {
      icon: XCircle,
      label: "Annulée",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  };

  const badge = badges[status as keyof typeof badges] || badges.draft;
  const Icon = badge.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${badge.className}`}
    >
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

export default async function MissionsPage({ params }: PageProps) {
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

  // Get all missions with assignment counts
  const missions = await db.query.volunteerMissions.findMany({
    where: eq(volunteerMissions.tenantId, tenant.id),
    orderBy: [desc(volunteerMissions.createdAt)],
  });

  const missionsWithCounts = await Promise.all(
    missions.map(async (mission) => {
      const [assignmentCount] = await db
        .select({ count: count() })
        .from(volunteerAssignments)
        .where(eq(volunteerAssignments.missionId, mission.id));

      return {
        ...mission,
        assignmentCount: assignmentCount?.count || 0,
      };
    })
  );

  // Group by status
  const draftMissions = missionsWithCounts.filter((m) => m.status === "draft");
  const publishedMissions = missionsWithCounts.filter((m) => m.status === "published");
  const inProgressMissions = missionsWithCounts.filter((m) => m.status === "in_progress");
  const completedMissions = missionsWithCounts.filter((m) => m.status === "completed");
  const cancelledMissions = missionsWithCounts.filter((m) => m.status === "cancelled");

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
            <Link
              href={`/dashboard/${tenantSlug}/volunteers`}
              className="hover:text-foreground"
            >
              Bénévoles
            </Link>
            <span>/</span>
            <span>Missions</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Missions de bénévolat</h1>
              <p className="text-muted-foreground mt-2">
                Gérez les missions et assignez des bénévoles
              </p>
            </div>
            {member.clearanceLevel >= 3 && (
              <Link href={`/dashboard/${tenantSlug}/volunteers/missions/new`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle mission
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold">{missionsWithCounts.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Publiées</p>
            <p className="text-2xl font-bold text-blue-600">{publishedMissions.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">En cours</p>
            <p className="text-2xl font-bold text-yellow-600">{inProgressMissions.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Terminées</p>
            <p className="text-2xl font-bold text-green-600">{completedMissions.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Brouillons</p>
            <p className="text-2xl font-bold text-gray-600">{draftMissions.length}</p>
          </div>
        </div>

        {/* Missions List */}
        {missionsWithCounts.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Aucune mission créée</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première mission de bénévolat
            </p>
            {member.clearanceLevel >= 3 && (
              <Link href={`/dashboard/${tenantSlug}/volunteers/missions/new`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une mission
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {missionsWithCounts.map((mission) => {
              const isFull = mission.assignmentCount >= mission.requiredCount;
              const fillPercentage = (mission.assignmentCount / mission.requiredCount) * 100;

              return (
                <Link
                  key={mission.id}
                  href={`/dashboard/${tenantSlug}/volunteers/missions/${mission.id}`}
                >
                  <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{mission.title}</h3>
                          {getStatusBadge(mission.status)}
                        </div>
                        {mission.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {mission.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {mission.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(mission.startDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {mission.endDate && (
                            <>
                              {" - "}
                              {new Date(mission.endDate).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </>
                          )}
                        </div>
                      )}
                      {mission.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {mission.location}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">
                            {mission.assignmentCount} / {mission.requiredCount} bénévoles
                          </span>
                        </div>
                        {isFull && (
                          <span className="text-xs text-green-600 font-medium">
                            Complet
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isFull ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
