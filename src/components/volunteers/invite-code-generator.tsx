"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShareableInviteLink } from "./shareable-invite-link";
import { Loader2 } from "lucide-react";

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

      toast.success("Code d'invitation créé", {
        description: "Le code a été généré avec succès. Vous pouvez maintenant le partager.",
      });

      // Reset form safely
      const form = e.currentTarget;
      if (form) {
        form.reset();
      }

      // Scroll to generated code
      setTimeout(() => {
        document.getElementById("generated-code")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMsg);
      toast.error("Erreur", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {generatedCode && (
        <div
          id="generated-code"
          className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-700 font-semibold">
              Code créé avec succès !
            </p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Votre code :</p>
            <code className="text-3xl font-bold tracking-wider text-green-700 block">
              {generatedCode}
            </code>
          </div>
          <ShareableInviteLink code={generatedCode} />
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
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Création en cours..." : "Générer un nouveau code"}
        </Button>
      </form>
    </div>
  );
}
