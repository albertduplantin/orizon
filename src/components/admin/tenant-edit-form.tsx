"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Tenant {
  id: string;
  name: string;
  description: string | null;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
}

interface TenantEditFormProps {
  tenant: Tenant;
}

export function TenantEditForm({ tenant }: TenantEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      eventStartDate: formData.get("eventStartDate") as string,
      eventEndDate: formData.get("eventEndDate") as string,
    };

    try {
      const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/tenants");
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'événement *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={tenant.name}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={tenant.description || ""}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventStartDate">Date de début</Label>
          <Input
            id="eventStartDate"
            name="eventStartDate"
            type="date"
            defaultValue={
              tenant.eventStartDate
                ? new Date(tenant.eventStartDate).toISOString().split("T")[0]
                : ""
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventEndDate">Date de fin</Label>
          <Input
            id="eventEndDate"
            name="eventEndDate"
            type="date"
            defaultValue={
              tenant.eventEndDate
                ? new Date(tenant.eventEndDate).toISOString().split("T")[0]
                : ""
            }
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
