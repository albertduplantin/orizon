import { requireSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { TenantEditForm } from "@/components/admin/tenant-edit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function EditTenantPage({ params }: PageProps) {
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/tenants">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Éditer l'événement</h1>
            <p className="text-muted-foreground">{tenant.name}</p>
          </div>

          {/* Form */}
          <div className="glass-card p-8 rounded-2xl">
            <TenantEditForm tenant={tenant} />
          </div>
        </div>
      </div>
    </div>
  );
}
