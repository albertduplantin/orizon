/**
 * Communication Module (Core)
 * Always available - Real-time messaging and collaboration
 */

import { MessageSquare } from "lucide-react";

export function CommunicationModule() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Communication</h2>
      </div>
      <p className="text-muted-foreground">
        Module Core - La communication est redirigée vers /dashboard/[slug]/communication
      </p>
    </div>
  );
}
