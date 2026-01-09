"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  User,
  Briefcase,
  Calendar,
  Car,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: string;
  clearanceLevel: number;
  joinedAt: Date;
  userName: string | null;
  userEmail: string | null;
}

interface MemberProfile {
  userId: string;
  tenantId: string;
  bio: string | null;
  skills: string[];
  availabilityWeekends: boolean;
  availabilityEvenings: boolean;
  availabilitySchoolHolidays: boolean;
  unavailableDates: string | null;
  hasDriverLicense: boolean;
  hasVehicle: boolean;
  vehicleSeats: number | null;
  city: string | null;
  postalCode: string | null;
  maxTravelDistance: number | null;
  preferredMissionTypes: string[];
}

interface MemberProfileEditorProps {
  tenantId: string;
  memberId: string;
  member: Member;
}

export function MemberProfileEditor({
  tenantId,
  memberId,
  member,
}: MemberProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newMissionType, setNewMissionType] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/members/${memberId}/profile`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du profil");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/members/${memberId}/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof MemberProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const addSkill = () => {
    if (!profile || !newSkill.trim()) return;
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill.trim()],
    });
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index),
    });
  };

  const addMissionType = () => {
    if (!profile || !newMissionType.trim()) return;
    setProfile({
      ...profile,
      preferredMissionTypes: [
        ...profile.preferredMissionTypes,
        newMissionType.trim(),
      ],
    });
    setNewMissionType("");
  };

  const removeMissionType = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      preferredMissionTypes: profile.preferredMissionTypes.filter(
        (_, i) => i !== index
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <p className="text-muted-foreground">
          Impossible de charger le profil
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Biographie et compétences du membre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bio */}
          <div className="space-y-2">
            <Label>Biographie</Label>
            <Textarea
              placeholder="Décrivez brièvement le parcours et les motivations..."
              value={profile.bio || ""}
              onChange={(e) => updateProfile("bio", e.target.value)}
              rows={4}
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Compétences</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Ex: Graphisme, Logistique, Comptabilité..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
              />
              <Button onClick={addSkill} type="button">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => removeSkill(index)}
                >
                  {skill} ×
                </Badge>
              ))}
              {profile.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucune compétence ajoutée
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Disponibilités
          </CardTitle>
          <CardDescription>
            Quand le membre peut participer aux missions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weekends"
              checked={profile.availabilityWeekends}
              onCheckedChange={(checked) =>
                updateProfile("availabilityWeekends", checked)
              }
            />
            <Label htmlFor="weekends" className="cursor-pointer">
              Disponible les week-ends
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="evenings"
              checked={profile.availabilityEvenings}
              onCheckedChange={(checked) =>
                updateProfile("availabilityEvenings", checked)
              }
            />
            <Label htmlFor="evenings" className="cursor-pointer">
              Disponible les soirs en semaine
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="schoolHolidays"
              checked={profile.availabilitySchoolHolidays}
              onCheckedChange={(checked) =>
                updateProfile("availabilitySchoolHolidays", checked)
              }
            />
            <Label htmlFor="schoolHolidays" className="cursor-pointer">
              Disponible pendant les vacances scolaires
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Logistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Logistique
          </CardTitle>
          <CardDescription>
            Permis, véhicule et capacités de transport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="driverLicense"
              checked={profile.hasDriverLicense}
              onCheckedChange={(checked) =>
                updateProfile("hasDriverLicense", checked)
              }
            />
            <Label htmlFor="driverLicense" className="cursor-pointer">
              Possède le permis de conduire
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicle"
              checked={profile.hasVehicle}
              onCheckedChange={(checked) =>
                updateProfile("hasVehicle", checked)
              }
            />
            <Label htmlFor="vehicle" className="cursor-pointer">
              Possède un véhicule
            </Label>
          </div>

          {profile.hasVehicle && (
            <div className="space-y-2">
              <Label>Nombre de places disponibles</Label>
              <Input
                type="number"
                min="1"
                max="50"
                placeholder="Ex: 4"
                value={profile.vehicleSeats || ""}
                onChange={(e) =>
                  updateProfile(
                    "vehicleSeats",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localisation
          </CardTitle>
          <CardDescription>
            Ville et zone de déplacement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                placeholder="Ex: Paris"
                value={profile.city || ""}
                onChange={(e) => updateProfile("city", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Code postal</Label>
              <Input
                placeholder="Ex: 75001"
                value={profile.postalCode || ""}
                onChange={(e) => updateProfile("postalCode", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Distance maximale de déplacement (km)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 20"
              value={profile.maxTravelDistance || ""}
              onChange={(e) =>
                updateProfile(
                  "maxTravelDistance",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferred Mission Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Types de missions préférées
          </CardTitle>
          <CardDescription>
            Les types de missions que le membre préfère
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ex: Logistique, Accueil, Technique..."
              value={newMissionType}
              onChange={(e) => setNewMissionType(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addMissionType()}
            />
            <Button onClick={addMissionType} type="button">
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.preferredMissionTypes.map((type, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-red-100"
                onClick={() => removeMissionType(index)}
              >
                {type} ×
              </Badge>
            ))}
            {profile.preferredMissionTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun type de mission préféré
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder le profil
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
