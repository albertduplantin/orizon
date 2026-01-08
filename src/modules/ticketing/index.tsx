/**
 * Ticketing Module
 * Ticket sales, registration, and management
 * Required Clearance: RED (1)
 */

import { Ticket } from "lucide-react";

export function TicketingModule() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Ticket className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Billetterie</h2>
      </div>
      <div className="glass-card p-6 rounded-2xl">
        <p className="text-muted-foreground mb-4">
          Module de gestion des billets et inscriptions (à venir)
        </p>
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Vente de billets</h3>
            <p className="text-sm text-muted-foreground">
              Créer et vendre des billets pour vos événements
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Gestion des commandes</h3>
            <p className="text-sm text-muted-foreground">
              Suivre et gérer les commandes de billets
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Validation d'entrée</h3>
            <p className="text-sm text-muted-foreground">
              Scanner les QR codes pour valider les entrées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
