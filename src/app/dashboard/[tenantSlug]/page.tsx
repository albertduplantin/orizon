import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function TenantDashboardPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  // Get tenant and check user has access
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
      modules: true,
      _count: {
        select: {
          volunteers: true,
          volunteerMissions: true,
        },
      },
    },
  });

  if (!tenant) {
    redirect("/dashboard");
  }

  // Check if user is a member of this tenant
  if (tenant.members.length === 0) {
    redirect("/dashboard");
  }

  const member = tenant.members[0];
  const volunteersModule = tenant.modules.find((m) => m.moduleId === "volunteers");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{tenant.name}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {member.role === "tenant_admin" ? "Administrateur" : "Membre"}
                </span>
              </div>
              {tenant.description && (
                <p className="text-muted-foreground">{tenant.description}</p>
              )}
              {tenant.eventStartDate && tenant.eventEndDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(tenant.eventStartDate).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(tenant.eventEndDate).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Bénévoles</h3>
              <p className="text-3xl font-bold">{tenant._count.volunteers}</p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Missions</h3>
              <p className="text-3xl font-bold">{tenant._count.volunteerMissions}</p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Modules actifs</h3>
              <p className="text-3xl font-bold">{tenant.modules.filter((m) => m.enabled).length}</p>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Modules disponibles</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Volunteers Module */}
                {volunteersModule && volunteersModule.enabled && (
                  <div className="p-6 border rounded-lg bg-white/50 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Gestion des Bénévoles</h3>
                        <p className="text-sm text-muted-foreground">
                          Gérez vos bénévoles et leurs missions
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Actif
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/${tenantSlug}/volunteers`}>
                        <Button>Accéder au module</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Coming Soon Modules */}
                <div className="p-6 border rounded-lg bg-white/30 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Billetterie</h3>
                      <p className="text-sm text-muted-foreground">
                        Vendez vos billets en ligne
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Bientôt
                    </span>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-white/30 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Communication</h3>
                      <p className="text-sm text-muted-foreground">
                        Envoyez des emails à vos participants
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Bientôt
                    </span>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-white/30 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Planning</h3>
                      <p className="text-sm text-muted-foreground">
                        Organisez votre événement dans le temps
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Bientôt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
