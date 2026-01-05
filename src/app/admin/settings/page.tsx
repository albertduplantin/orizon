import { requireSuperAdmin } from "@/lib/admin/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Paramètres administrateur</h1>
            <p className="text-muted-foreground">
              Configuration globale de la plateforme ORIZON
            </p>
          </div>

          {/* Settings Form */}
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
