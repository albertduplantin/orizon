"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package } from "lucide-react";

interface TenantActionsProps {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export function TenantActions({ tenantId, tenantName, tenantSlug }: TenantActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/tenants/${tenantId}/edit`)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Éditer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/tenants/${tenantId}/modules`)}
        >
          <Package className="w-4 h-4 mr-2" />
          Modules
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer l'événement <strong>{tenantName}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées (messages, canaux, bénévoles, etc.).
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
