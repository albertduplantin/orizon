import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Connexion - ORIZON",
  description: "Connectez-vous à votre compte ORIZON",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ORIZON
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour gérer vos événements
          </p>
        </div>

        {/* Sign In Form */}
        <div className="glass-card p-8 rounded-2xl">
          <SignInForm />
        </div>

        {/* Footer Links */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous n&apos;avez pas de compte ?{" "}
          <Link
            href="/signup"
            className="text-primary font-medium hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
