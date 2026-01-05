import { requireSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenants, users, tenantMembers, messages, channels } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Building2, MessageSquare, TrendingUp, Settings, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireSuperAdmin();

  // Analytics globaux
  const [
    totalTenantsResult,
    totalUsersResult,
    totalMessagesResult,
    activeTenantsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(tenants),
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(messages),
    db
      .select({ count: count() })
      .from(tenants)
      .where(sql`${tenants.createdAt} > NOW() - INTERVAL '30 days'`),
  ]);

  const totalTenants = totalTenantsResult[0]?.count || 0;
  const totalUsers = totalUsersResult[0]?.count || 0;
  const totalMessages = totalMessagesResult[0]?.count || 0;
  const activeTenants = activeTenantsResult[0]?.count || 0;

  // Derniers tenants créés
  const recentTenants = await db.query.tenants.findMany({
    orderBy: (tenants, { desc }) => [desc(tenants.createdAt)],
    limit: 5,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la plateforme ORIZON
          </p>
        </div>

        {/* Navigation rapide */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Link href="/admin/tenants">
            <div className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Gestion des Tenants</h3>
                  <p className="text-sm text-muted-foreground">
                    Voir tous les événements
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/pricing">
            <div className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Politique Tarifaire</h3>
                  <p className="text-sm text-muted-foreground">
                    Plans et pricing
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Paramètres</h3>
                  <p className="text-sm text-muted-foreground">
                    Configuration globale
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Statistiques globales */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-xl font-semibold mb-6">Statistiques Globales</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold">{totalTenants}</p>
              <p className="text-sm text-muted-foreground">Événements créés</p>
            </div>

            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{activeTenants}</p>
              <p className="text-sm text-muted-foreground">Actifs (30j)</p>
            </div>

            <div className="text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </div>

            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{totalMessages}</p>
              <p className="text-sm text-muted-foreground">Messages envoyés</p>
            </div>
          </div>
        </div>

        {/* Derniers tenants créés */}
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Derniers Événements Créés</h2>
            <Link href="/admin/tenants">
              <Button variant="outline">Voir tout</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentTenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/admin/tenants/${tenant.id}`}
                className="block"
              >
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Slug: {tenant.slug}
                      </p>
                      {tenant.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {tenant.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {recentTenants.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun événement créé pour le moment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
