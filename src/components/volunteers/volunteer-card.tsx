"use client";

import { useState } from "react";
import { VolunteerActions } from "./volunteer-actions";
import { Badge } from "@/components/ui/badge";

interface Volunteer {
  id: string;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface VolunteerCardProps {
  volunteer: Volunteer;
}

export function VolunteerCard({ volunteer: initialVolunteer }: VolunteerCardProps) {
  const [volunteer, setVolunteer] = useState(initialVolunteer);

  const handleStatusChange = (volunteerId: string, newStatus: string) => {
    setVolunteer({ ...volunteer, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            ✓ Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            ✗ Rejeté
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            ⏳ En attente
          </Badge>
        );
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-white/50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
            {volunteer.user.name?.[0]?.toUpperCase() || volunteer.user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {volunteer.user.name || "Sans nom"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {volunteer.user.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Inscrit le {new Date(volunteer.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {getStatusBadge(volunteer.status)}
          <VolunteerActions
            volunteer={volunteer}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
