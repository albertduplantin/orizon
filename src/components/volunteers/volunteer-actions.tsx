"use client";

import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Check, X, Loader2, AlertTriangle } from "lucide-react";

interface Volunteer {
  id: string;
  status: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface VolunteerActionsProps {
  volunteer: Volunteer;
  onStatusChange?: (volunteerId: string, newStatus: string) => void;
}

export function VolunteerActions({ volunteer, onStatusChange }: VolunteerActionsProps) {
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: "approve" | "reject";
    volunteerId: string;
  } | null>(null);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!pendingAction) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/volunteers/${pendingAction.volunteerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      toast.success(
        status === "approved" ? "Bénévole approuvé" : "Bénévole rejeté",
        {
          description: `${volunteer.user.name || volunteer.user.email} a été ${
            status === "approved" ? "approuvé" : "rejeté"
          }.`,
        }
      );

      onStatusChange?.(pendingAction.volunteerId, status);
      setPendingAction(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (volunteer.status !== "pending") {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-300 hover:bg-green-50"
          onClick={() =>
            setPendingAction({ action: "approve", volunteerId: volunteer.id })
          }
          disabled={loading}
        >
          <Check className="w-4 h-4 mr-1" />
          Approuver
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
          onClick={() =>
            setPendingAction({ action: "reject", volunteerId: volunteer.id })
          }
          disabled={loading}
        >
          <X className="w-4 h-4 mr-1" />
          Rejeter
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle
                className={`w-5 h-5 ${
                  pendingAction?.action === "approve"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
              <AlertDialogTitle>
                {pendingAction?.action === "approve"
                  ? "Approuver ce bénévole"
                  : "Rejeter ce bénévole"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {pendingAction?.action === "approve" ? (
                <>
                  <p className="mb-2">
                    Voulez-vous approuver{" "}
                    <strong className="text-foreground">
                      {volunteer.user.name || volunteer.user.email}
                    </strong>{" "}
                    comme bénévole ?
                  </p>
                  <p className="text-sm text-green-600">
                    ✓ Cette personne pourra accéder aux missions et se porter
                    volontaire.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">
                    Voulez-vous rejeter la candidature de{" "}
                    <strong className="text-foreground">
                      {volunteer.user.name || volunteer.user.email}
                    </strong>{" "}
                    ?
                  </p>
                  <p className="text-sm text-red-600">
                    ✗ Cette personne ne pourra pas participer aux missions.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleStatusChange(
                  pendingAction?.action === "approve" ? "approved" : "rejected"
                );
              }}
              disabled={loading}
              className={
                pendingAction?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading
                ? "Traitement..."
                : pendingAction?.action === "approve"
                ? "Approuver"
                : "Rejeter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
