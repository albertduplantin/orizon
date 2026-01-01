"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailSignUpForm } from "./email-signup-form";

export function SignUpForm() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = async () => {
    window.location.href = "/api/auth/signin?provider=google";
  };

  const handleAppleSignIn = async () => {
    window.location.href = "/api/auth/signin?provider=apple";
  };

  if (showEmailForm) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Créer un compte</h2>
          <p className="text-sm text-muted-foreground">
            Remplissez vos informations
          </p>
        </div>

        <EmailSignUpForm />

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowEmailForm(false)}
        >
          ← Retour aux options d&apos;inscription
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Créer un compte</h2>
        <p className="text-sm text-muted-foreground">
          Choisissez votre méthode d&apos;inscription
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        {/* Google Sign Up */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-11 text-base font-medium"
          type="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          S&apos;inscrire avec Google
        </Button>

        {/* Apple Sign Up */}
        <Button
          onClick={handleAppleSignIn}
          variant="outline"
          className="w-full h-11 text-base font-medium bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          type="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          S&apos;inscrire avec Apple
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>

      {/* Email Signup Button */}
      <Button
        onClick={() => setShowEmailForm(true)}
        variant="outline"
        className="w-full h-11 text-base font-medium"
        type="button"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        S&apos;inscrire avec un email
      </Button>

      {/* Benefits */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium text-center">
          Pourquoi ORIZON ?
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Gestion complète de vos événements
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Module bénévoles inclus gratuitement
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Interface moderne et intuitive
          </li>
        </ul>
      </div>

      {/* Terms */}
      <p className="text-xs text-center text-muted-foreground px-8">
        En créant un compte, vous acceptez nos{" "}
        <a href="/terms" className="underline hover:text-primary">
          Conditions d&apos;utilisation
        </a>{" "}
        et notre{" "}
        <a href="/privacy" className="underline hover:text-primary">
          Politique de confidentialité
        </a>
        .
      </p>
    </div>
  );
}
