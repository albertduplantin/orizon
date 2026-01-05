"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Ticket,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  type LucideIcon
} from "lucide-react";

interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  category: string;
  pricing: {
    free: boolean;
    tier: string;
  };
  enabled: boolean;
}

interface ModulesManagerProps {
  tenantId: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Ticket,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
};

const CATEGORY_LABELS: Record<string, string> = {
  management: "Gestion",
  commerce: "Commerce",
  communication: "Communication",
  finance: "Finance",
  organization: "Organisation",
};

export function ModulesManager({ tenantId }: ModulesManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, [tenantId]);

  const loadModules = async () => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/modules`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des modules");
      }
      const data = await response.json();
      setModules(data.modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    setUpdatingModule(moduleId);
    setError("");

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/modules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moduleId, enabled }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du module");
      }

      // Update local state
      setModules(modules.map(m =>
        m.id === moduleId ? { ...m, enabled } : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      // Reload modules to reset state
      loadModules();
    } finally {
      setUpdatingModule(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-muted-foreground">Chargement des modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl">
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Group modules by category
  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <div key={category} className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">
            {CATEGORY_LABELS[category] || category}
          </h3>

          <div className="space-y-4">
            {categoryModules.map((module) => {
              const Icon = ICON_MAP[module.icon] || Users;
              const isUpdating = updatingModule === module.id;

              return (
                <div
                  key={module.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 h-fit">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium text-base">
                          {module.name}
                        </Label>
                        {module.pricing.free ? (
                          <Badge variant="secondary">Gratuit</Badge>
                        ) : (
                          <Badge variant="default">
                            {module.pricing.tier === "premium" && "Premium"}
                            {module.pricing.tier === "enterprise" && "Enterprise"}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Version {module.version}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-muted-foreground">
                        {module.enabled ? "Activé" : "Désactivé"}
                      </p>
                    </div>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={(checked) => toggleModule(module.id, checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {modules.length === 0 && (
        <div className="glass-card p-12 rounded-2xl text-center">
          <p className="text-muted-foreground">
            Aucun module disponible
          </p>
        </div>
      )}
    </div>
  );
}
