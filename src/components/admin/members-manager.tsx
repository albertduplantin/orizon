"use client";

import { useState } from "react";
import { ClearanceBadge } from "./clearance-badge";
import { ClearanceSelector } from "./clearance-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, X, UserPlus, Search, Filter } from "lucide-react";
import type { ClearanceLevel } from "@/lib/clearance";
import { ASSOCIATION_ROLES } from "@/lib/clearance-mapping";

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

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [clearanceFilter, setClearanceFilter] = useState<string>("all");

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("volunteer");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");

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

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setInviting(true);
    setError("");
    setInviteSuccess("");

    try {
      const response = await fetch("/api/invite-codes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          moduleId: null,
          role: inviteRole,
          maxUses: 1,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdBy: "admin", // TODO: Get from current user
          email: inviteEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'invitation");
      }

      setInviteSuccess(`Invitation envoyée à ${inviteEmail} !`);
      setInviteEmail("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setInviteDialogOpen(false);
        setInviteSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setInviting(false);
    }
  };

  // Filter members
  const filteredMembers = localMembers.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    const matchesClearance =
      clearanceFilter === "all" || member.clearanceLevel === parseInt(clearanceFilter);

    return matchesSearch && matchesRole && matchesClearance;
  });

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

      {/* Toolbar: Search, Filters, Invite */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="volunteer">Bénévole</SelectItem>
              <SelectItem value="coordinator">Coordinateur</SelectItem>
              <SelectItem value="module_manager">Responsable</SelectItem>
              <SelectItem value="ca_member">Membre CA</SelectItem>
              <SelectItem value="bureau_member">Membre Bureau</SelectItem>
              <SelectItem value="president">Président</SelectItem>
            </SelectContent>
          </Select>

          {/* Clearance Filter */}
          <Select value={clearanceFilter} onValueChange={setClearanceFilter}>
            <SelectTrigger className="w-[180px]">
              <Shield className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tous niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              <SelectItem value="0">INFRARED (0)</SelectItem>
              <SelectItem value="1">RED (1)</SelectItem>
              <SelectItem value="2">ORANGE (2)</SelectItem>
              <SelectItem value="3">YELLOW (3)</SelectItem>
              <SelectItem value="4">GREEN (4)</SelectItem>
              <SelectItem value="5">BLUE (5)</SelectItem>
              <SelectItem value="6">ULTRAVIOLET (6)</SelectItem>
            </SelectContent>
          </Select>

          {/* Invite Button */}
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un nouveau membre</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email avec le rôle approprié
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {inviteSuccess && (
                  <div className="p-4 rounded-md bg-green-50 border border-green-200">
                    <p className="text-sm text-green-600">{inviteSuccess}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rôle</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASSOCIATION_ROLES).map(([key, role]) => (
                        <SelectItem key={key} value={key}>
                          {role.name} - {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="w-full">
                  {inviting ? "Envoi en cours..." : "Envoyer l'invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} membre{filteredMembers.length > 1 ? "s" : ""}
            {filteredMembers.length !== localMembers.length && ` sur ${localMembers.length}`}
          </p>
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member) => {
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
