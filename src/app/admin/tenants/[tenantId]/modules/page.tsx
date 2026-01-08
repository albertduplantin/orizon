import { requireSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { ModulesManager } from "@/components/admin/modules-manager";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantModulesPage({ params }: PageProps) {
  await requireSuperAdmin();

  const { tenantId } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    redirect("/admin/tenants");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/tenants">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste des événements
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Gestion des modules</h1>
            <p className="text-muted-foreground">
              Événement : <strong>{tenant.name}</strong>
            </p>
          </div>

          {/* Core Modules Info */}
          <div className="glass-card p-6 rounded-2xl mb-6 border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Module Communication (Core)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  La Communication est un module Core toujours disponible pour tous les événements.
                  Elle constitue la couche de base utilisée par tous les autres modules pour permettre
                  la collaboration en temps réel.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  ✓ Toujours actif
                </div>
              </div>
            </div>
          </div>

          {/* Modules Manager */}
          <ModulesManager tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
