import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";

export default async function CompleteProfilePage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!dbUser) {
    // User doesn't exist in DB yet - redirect to dashboard which will handle creation
    redirect("/dashboard");
  }

  // Check if profile is complete
  const hasEmail = !!dbUser.email;
  const hasPhone = !!dbUser.phone;

  if (hasEmail && hasPhone) {
    // Profile is complete, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-xl max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Complétez votre profil</h1>
          <p className="text-muted-foreground text-sm">
            Pour continuer, nous avons besoin de quelques informations supplémentaires.
          </p>
        </div>

        <CompleteProfileForm
          userId={dbUser.id}
          currentEmail={dbUser.email}
          currentPhone={dbUser.phone}
          needsEmail={!hasEmail}
          needsPhone={!hasPhone}
        />
      </div>
    </div>
  );
}
