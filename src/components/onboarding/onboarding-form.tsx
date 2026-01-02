"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface OnboardingFormProps {
  user: any;
}

export function OnboardingForm({ user }: OnboardingFormProps) {
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
      const response = await fetch("/api/tenants/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      const result = await response.json();
      router.push(`/dashboard/${result.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l&apos;événement *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Festival des Arts 2026"
          required
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Le nom de votre festival, événement ou salon
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Décrivez votre événement..."
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
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventEndDate">Date de fin</Label>
          <Input
            id="eventEndDate"
            name="eventEndDate"
            type="date"
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Création en cours..." : "Créer mon événement"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Vous pourrez modifier ces informations plus tard
      </p>
    </form>
  );
}
