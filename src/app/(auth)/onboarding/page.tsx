import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata: Metadata = {
  title: "Finaliser votre inscription - ORIZON",
  description: "Complétez votre profil pour continuer",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // If onboarding already completed, redirect to dashboard
  // TODO: Check user.onboardingCompleted from database

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ORIZON
          </h1>
          <p className="text-muted-foreground">
            Une dernière étape avant de commencer
          </p>
        </div>

        {/* Onboarding Form */}
        <div className="glass-card p-8 rounded-2xl">
          <OnboardingForm user={session.user} />
        </div>
      </div>
    </div>
  );
}
