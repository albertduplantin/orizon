"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SetAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetSuperAdmin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/debug/set-super-admin", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Définir comme Super Admin
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Cliquez sur le bouton ci-dessous pour vous définir comme super administrateur.
        </p>

        <Button
          onClick={handleSetSuperAdmin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Mise à jour en cours..." : "Devenir Super Admin"}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold mb-2">✅ Succès !</p>
            <p className="text-sm text-green-700">
              Email: {result.user?.email}
            </p>
            <p className="text-sm text-green-700">
              Rôle: {result.user?.role}
            </p>
            <p className="text-xs text-green-600 mt-2">
              Veuillez rafraîchir la page pour voir le bouton "Administration" apparaître.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Erreur</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
