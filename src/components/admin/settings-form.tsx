"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    // Général
    platformName: "ORIZON",
    supportEmail: "support@orizon.com",
    maxTenantsPerUser: 5,

    // Modules
    enableCommunication: true,
    enableVolunteers: true,
    enableSchedule: true,
    enableDocuments: true,
    enableAnalytics: true,

    // Limites
    maxMembersPerTenant: 100,
    maxChannelsPerTenant: 50,
    maxMessagesPerDay: 1000,
    maxStoragePerTenantMB: 1000,

    // Invitations
    inviteCodeExpirationDays: 30,
    maxInviteCodesPerTenant: 10,

    // Sécurité
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeoutMinutes: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setSuccess("Paramètres sauvegardés avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold mb-4">Paramètres généraux</h3>

            <div className="space-y-2">
              <Label htmlFor="platformName">Nom de la plateforme</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de support</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTenantsPerUser">Nombre max d&apos;événements par utilisateur</Label>
              <Input
                id="maxTenantsPerUser"
                type="number"
                min="1"
                value={settings.maxTenantsPerUser}
                onChange={(e) => setSettings({ ...settings, maxTenantsPerUser: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>
          </div>
        </TabsContent>

        {/* Onglet Modules */}
        <TabsContent value="modules" className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold mb-4">Modules disponibles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Activez ou désactivez les modules pour tous les événements
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="enableCommunication" className="font-medium">Communication</Label>
                  <p className="text-sm text-muted-foreground">Messagerie et canaux de discussion</p>
                </div>
                <Switch
                  id="enableCommunication"
                  checked={settings.enableCommunication}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableCommunication: checked })}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="enableVolunteers" className="font-medium">Bénévoles</Label>
                  <p className="text-sm text-muted-foreground">Gestion des bénévoles et missions</p>
                </div>
                <Switch
                  id="enableVolunteers"
                  checked={settings.enableVolunteers}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableVolunteers: checked })}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="enableSchedule" className="font-medium">Calendrier</Label>
                  <p className="text-sm text-muted-foreground">Planning et horaires</p>
                </div>
                <Switch
                  id="enableSchedule"
                  checked={settings.enableSchedule}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableSchedule: checked })}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="enableDocuments" className="font-medium">Documents</Label>
                  <p className="text-sm text-muted-foreground">Partage de documents et fichiers</p>
                </div>
                <Switch
                  id="enableDocuments"
                  checked={settings.enableDocuments}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableDocuments: checked })}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="enableAnalytics" className="font-medium">Analytiques</Label>
                  <p className="text-sm text-muted-foreground">Statistiques et rapports</p>
                </div>
                <Switch
                  id="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Limites */}
        <TabsContent value="limits" className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold mb-4">Limites de ressources</h3>

            <div className="space-y-2">
              <Label htmlFor="maxMembersPerTenant">Membres max par événement</Label>
              <Input
                id="maxMembersPerTenant"
                type="number"
                min="1"
                value={settings.maxMembersPerTenant}
                onChange={(e) => setSettings({ ...settings, maxMembersPerTenant: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChannelsPerTenant">Canaux max par événement</Label>
              <Input
                id="maxChannelsPerTenant"
                type="number"
                min="1"
                value={settings.maxChannelsPerTenant}
                onChange={(e) => setSettings({ ...settings, maxChannelsPerTenant: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMessagesPerDay">Messages max par jour</Label>
              <Input
                id="maxMessagesPerDay"
                type="number"
                min="1"
                value={settings.maxMessagesPerDay}
                onChange={(e) => setSettings({ ...settings, maxMessagesPerDay: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStoragePerTenantMB">Stockage max par événement (MB)</Label>
              <Input
                id="maxStoragePerTenantMB"
                type="number"
                min="100"
                step="100"
                value={settings.maxStoragePerTenantMB}
                onChange={(e) => setSettings({ ...settings, maxStoragePerTenantMB: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCodeExpirationDays">Expiration des codes d&apos;invitation (jours)</Label>
              <Input
                id="inviteCodeExpirationDays"
                type="number"
                min="1"
                value={settings.inviteCodeExpirationDays}
                onChange={(e) => setSettings({ ...settings, inviteCodeExpirationDays: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxInviteCodesPerTenant">Codes d&apos;invitation max par événement</Label>
              <Input
                id="maxInviteCodesPerTenant"
                type="number"
                min="1"
                value={settings.maxInviteCodesPerTenant}
                onChange={(e) => setSettings({ ...settings, maxInviteCodesPerTenant: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>
          </div>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold mb-4">Paramètres de sécurité</h3>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="requireEmailVerification" className="font-medium">
                  Vérification email obligatoire
                </Label>
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs doivent vérifier leur email
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="enableTwoFactor" className="font-medium">
                  Authentification à deux facteurs
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activer 2FA pour tous les utilisateurs
                </p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => setSettings({ ...settings, enableTwoFactor: checked })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeoutMinutes">Timeout de session (minutes)</Label>
              <Input
                id="sessionTimeoutMinutes"
                type="number"
                min="5"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Messages */}
      {success && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200 mt-6">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 mt-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
      </div>
    </form>
  );
}
