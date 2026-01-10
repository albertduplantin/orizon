"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface Volunteer {
  id: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Assignment {
  id: string;
  status: string;
  notes: string | null;
  volunteer: Volunteer;
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  requiredCount: number;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  createdAt: Date;
  assignments: Assignment[];
}

interface MissionDetailsProps {
  mission: Mission;
  tenantSlug: string;
  tenantId: string;
  canEdit: boolean;
  approvedVolunteers: Volunteer[];
}

export function MissionDetails({
  mission,
  tenantSlug,
  tenantId,
  canEdit,
  approvedVolunteers,
}: MissionDetailsProps) {
  const router = useRouter();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const assignedVolunteerIds = mission.assignments.map((a) => a.volunteer.id);
  const availableVolunteers = approvedVolunteers.filter(
    (v) => !assignedVolunteerIds.includes(v.id)
  );

  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/volunteers/missions/${mission.id}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            volunteerId: selectedVolunteer,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'assignation");
      }

      toast.success("Bénévole assigné", {
        description: "Le bénévole a été assigné à la mission avec succès.",
      });

      setShowAssignDialog(false);
      setSelectedVolunteer("");
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignVolunteer = async (assignmentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/volunteers/missions/${mission.id}/assignments/${assignmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la désassignation");
      }

      toast.success("Bénévole retiré", {
        description: "Le bénévole a été retiré de la mission.",
      });

      setShowUnassignDialog(null);
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMission = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/volunteers/missions/${mission.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Mission supprimée", {
        description: "La mission a été supprimée avec succès.",
      });

      router.push(`/dashboard/${tenantSlug}/volunteers/missions`);
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFull = mission.assignments.length >= mission.requiredCount;

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Détails de la mission</h2>
                <p className="text-sm text-muted-foreground">
                  Créée le {new Date(mission.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Link href={`/dashboard/${tenantSlug}/volunteers/missions/${mission.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            {mission.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{mission.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {mission.startDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Dates
                  </div>
                  <p className="font-medium">
                    {new Date(mission.startDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {mission.endDate && (
                      <>
                        {" - "}
                        {new Date(mission.endDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </>
                    )}
                  </p>
                </div>
              )}

              {mission.location && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    Lieu
                  </div>
                  <p className="font-medium">{mission.location}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  Bénévoles requis
                </div>
                <p className="font-medium">{mission.requiredCount}</p>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Statut</div>
                <p className="font-medium">{mission.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Bénévoles assignés ({mission.assignments.length}/{mission.requiredCount})
              </h3>
              {canEdit && !isFull && mission.status !== "draft" && mission.status !== "cancelled" && (
                <Button
                  size="sm"
                  onClick={() => setShowAssignDialog(true)}
                  disabled={availableVolunteers.length === 0}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assigner
                </Button>
              )}
            </div>

            {isFull && (
              <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Mission complète
                </p>
              </div>
            )}

            {mission.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun bénévole assigné
              </p>
            ) : (
              <div className="space-y-3">
                {mission.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {assignment.volunteer.user.name || assignment.volunteer.user.email}
                      </p>
                      {assignment.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {assignment.notes}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowUnassignDialog(assignment.id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un bénévole</DialogTitle>
            <DialogDescription>
              Sélectionnez un bénévole approuvé pour cette mission
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un bénévole..." />
              </SelectTrigger>
              <SelectContent>
                {availableVolunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.user.name || volunteer.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAssignVolunteer}
              disabled={!selectedVolunteer || loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Dialog */}
      <AlertDialog
        open={!!showUnassignDialog}
        onOpenChange={(open) => !open && setShowUnassignDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce bénévole ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le bénévole sera retiré de cette mission. Cette action peut être inversée
              en le réassignant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (showUnassignDialog) {
                  handleUnassignVolunteer(showUnassignDialog);
                }
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDialogTitle>Supprimer cette mission ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              <p className="mb-2">
                Êtes-vous sûr de vouloir supprimer la mission{" "}
                <strong className="text-foreground">{mission.title}</strong> ?
              </p>
              <p className="text-sm text-red-600">
                ⚠ Cette action est irréversible et supprimera également toutes les
                assignations.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteMission();
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
