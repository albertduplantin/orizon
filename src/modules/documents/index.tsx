/**
 * Documents Module
 * File sharing and document management
 * Required Clearance: ORANGE (2)
 */

import { FileText } from "lucide-react";

export function DocumentsModule() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Documents</h2>
      </div>
      <div className="glass-card p-6 rounded-2xl">
        <p className="text-muted-foreground mb-4">
          Module de partage et gestion de documents (à venir)
        </p>
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Upload de fichiers</h3>
            <p className="text-sm text-muted-foreground">
              Partager des documents avec votre équipe
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Organisation par dossiers</h3>
            <p className="text-sm text-muted-foreground">
              Organiser vos documents dans des dossiers
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Versioning</h3>
            <p className="text-sm text-muted-foreground">
              Historique des versions de vos documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
