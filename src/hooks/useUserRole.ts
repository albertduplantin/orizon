"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface UserRole {
  role: string | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

export function useUserRole(): UserRole {
  const { isSignedIn, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setRole(null);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/role");
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
          setIsSuperAdmin(data.isSuperAdmin);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [isSignedIn, isLoaded]);

  return { role, isSuperAdmin, isLoading };
}
