"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone } from "lucide-react";

interface CompleteProfileFormProps {
  userId: string;
  currentEmail: string | null;
  currentPhone: string | null;
  needsEmail: boolean;
  needsPhone: boolean;
}

export function CompleteProfileForm({
  userId,
  currentEmail,
  currentPhone,
  needsEmail,
  needsPhone,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(currentEmail || "");
  const [phone, setPhone] = useState(currentPhone || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email: needsEmail ? email : undefined,
          phone: needsPhone ? phone : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      toast.success("Profil complété", {
        description: "Vos informations ont été enregistrées avec succès.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {needsEmail && (
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Adresse email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Nous utilisons votre email pour les notifications importantes.
          </p>
        </div>
      )}

      {needsPhone && (
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Numéro de téléphone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            required
            disabled={loading}
            pattern="^[+]?[\d\s\-().]+$"
          />
          <p className="text-xs text-muted-foreground">
            Votre numéro de téléphone pour les communications urgentes.
          </p>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Enregistrement..." : "Continuer"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>
          Ces informations sont requises pour utiliser la plateforme et garantir
          une communication efficace avec votre équipe.
        </p>
      </div>
    </form>
  );
}
