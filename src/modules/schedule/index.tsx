/**
 * Schedule Module
 * Event planning, timelines, and volunteer scheduling
 * Required Clearance: ORANGE (2)
 */

import { Calendar } from "lucide-react";

export function ScheduleModule() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Planning</h2>
      </div>
      <div className="glass-card p-6 rounded-2xl">
        <p className="text-muted-foreground mb-4">
          Module de gestion du planning et des horaires (à venir)
        </p>
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Timeline de l'événement</h3>
            <p className="text-sm text-muted-foreground">
              Planifier les différentes phases de votre événement
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Planning des bénévoles</h3>
            <p className="text-sm text-muted-foreground">
              Assigner les bénévoles aux différents créneaux horaires
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Export calendrier</h3>
            <p className="text-sm text-muted-foreground">
              Exporter le planning au format .ics pour calendriers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
