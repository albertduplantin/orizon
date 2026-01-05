"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";

export function Header() {
  const { isSignedIn, user } = useUser();
  const { isSuperAdmin } = useUserRole();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={isSignedIn ? "/dashboard" : "/"}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            ORIZON
          </Link>

          {/* Navigation & User */}
          <div className="flex items-center gap-4">
            {/* Pricing link - always visible, positioned first */}
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                Tarifs
              </Button>
            </Link>

            {isSignedIn ? (
              <>
                {/* Super Admin link */}
                {isSuperAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Administration
                    </Button>
                  </Link>
                )}

                {/* User info */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Connecté en tant que</span>
                  <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>

                {/* User button with sign out */}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Commencer
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
