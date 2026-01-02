"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InviteCodeGeneratorProps {
  tenantId: string;
  userId: string;
}

export function InviteCodeGenerator({
  tenantId,
  userId,
}: InviteCodeGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedCode(null);

    const formData = new FormData(e.currentTarget);
    const maxUses = parseInt(formData.get("maxUses") as string) || 1;
    const expiresInDays = parseInt(formData.get("expiresInDays") as string) || 0;

    const data = {
      tenantId,
      moduleId: "volunteers",
      role: "member",
      maxUses,
      expiresAt:
        expiresInDays > 0
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
      createdBy: userId,
    };

    try {
      const response = await fetch("/api/invite-codes/create", {
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
      setGeneratedCode(result.code);

      // Reset form
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {generatedCode && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-600 font-medium mb-2">
            Code créé avec succès !
          </p>
          <div className="flex items-center gap-2">
            <code className="text-2xl font-bold tracking-wider flex-1">
              {generatedCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/join/${generatedCode}`
                );
              }}
            >
              Copier le lien
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxUses">Nombre d&apos;utilisations maximum</Label>
          <Input
            id="maxUses"
            name="maxUses"
            type="number"
            min="1"
            defaultValue="1"
            disabled={loading}
            required
          />
          <p className="text-xs text-muted-foreground">
            Nombre de personnes pouvant utiliser ce code
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresInDays">Expiration (jours)</Label>
          <Input
            id="expiresInDays"
            name="expiresInDays"
            type="number"
            min="0"
            defaultValue="30"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Laissez 0 pour aucune expiration
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : "Générer un code"}
        </Button>
      </form>
    </div>
  );
}
