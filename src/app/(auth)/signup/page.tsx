import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Créer un compte - ORIZON",
  description: "Créez votre compte ORIZON et commencez à gérer vos événements",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ORIZON
          </h1>
          <p className="text-muted-foreground">
            Créez votre compte et gérez vos événements facilement
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="glass-card p-8 rounded-2xl">
          <SignUpForm />
        </div>

        {/* Footer Links */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/signin"
            className="text-primary font-medium hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
