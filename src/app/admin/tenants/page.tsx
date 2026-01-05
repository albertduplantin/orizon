import { requireSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenants, tenantMembers, tenantModules, messages, channels } from "@/db/schema";
import { count, eq, sql, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageSquare, Package } from "lucide-react";

export default async function TenantsManagementPage() {
  await requireSuperAdmin();

  // Récupérer tous les tenants avec leurs statistiques
  const allTenants = await db.query.tenants.findMany({
    orderBy: [desc(tenants.createdAt)],
    with: {
      modules: true,
    },
  });

  // Récupérer les stats pour chaque tenant
  const tenantsWithStats = await Promise.all(
    allTenants.map(async (tenant) => {
      const [membersCount, messagesCount, channelsCount] = await Promise.all([
        db.select({ count: count() })
          .from(tenantMembers)
          .where(eq(tenantMembers.tenantId, tenant.id)),
        db.select({ count: count() })
          .from(messages)
          .where(eq(messages.tenantId, tenant.id)),
        db.select({ count: count() })
          .from(channels)
          .where(eq(channels.tenantId, tenant.id)),
      ]);

      return {
        ...tenant,
        stats: {
          members: membersCount[0]?.count || 0,
          messages: messagesCount[0]?.count || 0,
          channels: channelsCount[0]?.count || 0,
        },
      };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Gestion des Tenants</h1>
          <p className="text-muted-foreground">
            {tenantsWithStats.length} événement{tenantsWithStats.length > 1 ? "s" : ""} créé{tenantsWithStats.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des tenants */}
        <div className="space-y-4">
          {tenantsWithStats.map((tenant) => (
            <div key={tenant.id} className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{tenant.name}</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {tenant.slug}
                    </span>
                  </div>
                  {tenant.description && (
                    <p className="text-muted-foreground mb-2">
                      {tenant.description}
                    </p>
                  )}
                  {tenant.eventStartDate && tenant.eventEndDate && (
                    <p className="text-sm text-muted-foreground">
                      📅 Du {new Date(tenant.eventStartDate).toLocaleDateString("fr-FR")}
                      au {new Date(tenant.eventEndDate).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  Créé le {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">{tenant.stats.members}</p>
                    <p className="text-xs text-muted-foreground">Membres</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-semibold">{tenant.stats.messages}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold">
                      {tenant.modules.filter(m => m.enabled).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Modules actifs</p>
                  </div>
                </div>
              </div>

              {/* Modules activés */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Modules activés :</p>
                <div className="flex flex-wrap gap-2">
                  {tenant.modules.filter(m => m.enabled).map((module) => (
                    <span
                      key={module.id}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {module.moduleId}
                    </span>
                  ))}
                  {tenant.modules.filter(m => m.enabled).length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      Aucun module activé
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/admin/tenants/${tenant.id}`}>
                  <Button variant="outline" size="sm">
                    Voir les détails
                  </Button>
                </Link>
                <Link href={`/dashboard/${tenant.slug}`}>
                  <Button variant="ghost" size="sm">
                    Voir le tenant →
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {tenantsWithStats.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <p className="text-muted-foreground">
                Aucun événement créé pour le moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
