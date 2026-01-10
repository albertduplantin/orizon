"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Package, Users, AlertTriangle, Loader2 } from "lucide-react";

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
        toast.success("Événement supprimé", {
          description: `L'événement "${tenantName}" et toutes ses données ont été supprimés.`,
        });
        router.push("/admin");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error("Erreur lors de la suppression", {
          description: data.error || "Une erreur est survenue",
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
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
        variant="outline"
        size="sm"
        onClick={() => router.push(`/admin/tenants/${tenantId}/members`)}
      >
        <Users className="w-4 h-4 mr-2" />
        Membres
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer l'événement <strong className="text-foreground">{tenantName}</strong> ?
              </p>
              <p className="text-red-600 font-medium">
                ⚠️ Cette action est irréversible et supprimera définitivement :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>Tous les membres ({tenantSlug})</li>
                <li>Tous les messages et canaux de communication</li>
                <li>Tous les bénévoles et missions</li>
                <li>Toutes les configurations de modules</li>
                <li>Toutes les données associées à cet événement</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeleting ? "Suppression en cours..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
