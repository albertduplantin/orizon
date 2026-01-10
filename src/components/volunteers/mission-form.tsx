"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, MapPin, Users } from "lucide-react";

interface MissionFormProps {
  tenantId: string;
  tenantSlug: string;
  initialData?: {
    id?: string;
    title: string;
    description: string | null;
    requiredCount: number;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    location: string | null;
  };
  mode?: "create" | "edit";
}

export function MissionForm({
  tenantId,
  tenantSlug,
  initialData,
  mode = "create",
}: MissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    requiredCount: initialData?.requiredCount || 1,
    status: initialData?.status || "draft",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 16)
      : "",
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 16)
      : "",
    location: initialData?.location || "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "create"
          ? "/api/volunteers/missions"
          : `/api/volunteers/missions/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tenantId,
          requiredCount: parseInt(formData.requiredCount.toString()),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      const result = await response.json();

      toast.success(
        mode === "create" ? "Mission créée" : "Mission mise à jour",
        {
          description: `La mission "${formData.title}" a été ${
            mode === "create" ? "créée" : "mise à jour"
          } avec succès.`,
        }
      );

      // Redirect to mission details or list
      if (mode === "create") {
        router.push(
          `/dashboard/${tenantSlug}/volunteers/missions/${result.mission.id}`
        );
      } else {
        router.push(`/dashboard/${tenantSlug}/volunteers/missions`);
      }
      router.refresh();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Titre de la mission <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Ex: Accueil des visiteurs"
          required
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Décrivez les tâches et responsabilités..."
          rows={4}
          disabled={loading}
        />
      </div>

      {/* Required Count & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requiredCount" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Nombre de bénévoles
          </Label>
          <Input
            id="requiredCount"
            type="number"
            min="1"
            value={formData.requiredCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                requiredCount: parseInt(e.target.value) || 1,
              })
            }
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publiée</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date de début
          </Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date de fin
          </Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Lieu
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Ex: Stand principal, Entrée A"
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading
            ? "Enregistrement..."
            : mode === "create"
            ? "Créer la mission"
            : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
