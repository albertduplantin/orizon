"use client";

import { useState } from "react";
import { ClearanceBadge } from "./clearance-badge";
import { ClearanceSelector } from "./clearance-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, X } from "lucide-react";
import type { ClearanceLevel } from "@/lib/clearance";

interface Member {
  id: string;
  userId: string;
  role: string;
  clearanceLevel: number;
  joinedAt: Date;
  userName: string | null;
  userEmail: string | null;
}

interface MembersManagerProps {
  tenantId: string;
  members: Member[];
}

export function MembersManager({ tenantId, members }: MembersManagerProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState(members);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClearanceChange = async (memberId: string, newLevel: ClearanceLevel) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clearanceLevel: newLevel }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Update local state
      setLocalMembers(localMembers.map(m =>
        m.id === memberId ? { ...m, clearanceLevel: newLevel } : m
      ));

      setEditingMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (localMembers.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <p className="text-muted-foreground">
          Aucun membre dans cet événement
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl">
        <div className="space-y-4">
          {localMembers.map((member) => {
            const isEditing = editingMember === member.id;

            return (
              <div
                key={member.id}
                className="p-4 rounded-lg border hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">
                        {member.userName || "Utilisateur sans nom"}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {member.userEmail}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Membre depuis le {new Date(member.joinedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Clearance Badge */}
                  <div className="flex items-center gap-3">
                    <ClearanceBadge level={member.clearanceLevel as ClearanceLevel} />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMember(isEditing ? null : member.id)}
                      disabled={loading}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {isEditing ? "Annuler" : "Modifier"}
                    </Button>
                  </div>
                </div>

                {/* Clearance Editor */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t">
                    <ClearanceSelector
                      value={member.clearanceLevel as ClearanceLevel}
                      onChange={(level) => handleClearanceChange(member.id, level)}
                      disabled={loading}
                      maxLevel={5} // Admins can set up to BLUE (tenant admin)
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">Système Rainbow Clearance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-900">0 INFRARED</span>
            <span className="text-muted-foreground">Public - Informations générales</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-red-500">1 RED</span>
            <span className="text-muted-foreground">Participant - Accès de base</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-orange-500">2 ORANGE</span>
            <span className="text-muted-foreground">Bénévole - Missions et planning</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-yellow-500">3 YELLOW</span>
            <span className="text-muted-foreground">Coordinateur - Gestion d'équipe</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-green-500">4 GREEN</span>
            <span className="text-muted-foreground">Responsable - Stats et budgets</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-blue-500">5 BLUE</span>
            <span className="text-muted-foreground">Admin - Configuration complète</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-purple-500">6 ULTRAVIOLET</span>
            <span className="text-muted-foreground">Super Admin - Accès plateforme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
