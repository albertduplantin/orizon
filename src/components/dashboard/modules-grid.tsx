"use client";

import Link from "next/link";
import { type ModuleDefinition } from "@/lib/modules";
import { ClearanceBadge } from "@/components/admin/clearance-badge";
import {
  Users,
  Ticket,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface ModulesGridProps {
  modules: ModuleDefinition[];
  tenantSlug: string;
  userClearance: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Ticket,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
};

const ROUTE_MAP: Record<string, string> = {
  communication: "communication",
  volunteers: "volunteers",
  ticketing: "ticketing",
  schedule: "schedule",
  documents: "documents",
  analytics: "analytics",
};

export function ModulesGrid({ modules, tenantSlug, userClearance }: ModulesGridProps) {
  if (modules.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <p className="text-muted-foreground">
          Aucun module disponible pour votre niveau d'accréditation
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => {
        const Icon = ICON_MAP[module.icon] || Users;
        const route = ROUTE_MAP[module.id] || module.id;
        const hasAccess = userClearance >= (module.requiredClearance ?? 0);
        const isCoreModule = !module.pricing.tier || module.id === "communication";

        return (
          <Link
            key={module.id}
            href={hasAccess ? `/dashboard/${tenantSlug}/${route}` : "#"}
            className={`
              glass-card p-6 rounded-2xl transition-all
              ${hasAccess ? "hover:shadow-lg hover:scale-105 cursor-pointer" : "opacity-60 cursor-not-allowed"}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-2 items-end">
                {isCoreModule && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    Core
                  </span>
                )}
                {module.requiredClearance !== undefined && (
                  <ClearanceBadge level={module.requiredClearance as any} />
                )}
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2">{module.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{module.description}</p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">v{module.version}</span>
              {!module.pricing.free && (
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {module.pricing.tier}
                </span>
              )}
            </div>

            {!hasAccess && (
              <div className="mt-3 p-2 rounded-md bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">
                  Clearance insuffisante (requis: niveau {module.requiredClearance})
                </p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
