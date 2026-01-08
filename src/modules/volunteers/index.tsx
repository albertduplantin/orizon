/**
 * Volunteers Module
 * Manage volunteers, missions, and assignments
 * Required Clearance: ORANGE (2)
 */

import { Users } from "lucide-react";

export function VolunteersModule() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Gestion Bénévoles</h2>
      </div>
      <p className="text-muted-foreground">
        Ce module est redirigé vers /dashboard/[slug]/volunteers
      </p>
    </div>
  );
}
