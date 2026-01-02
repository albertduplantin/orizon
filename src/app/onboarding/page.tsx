import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, tenantMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let dbUser = null;

  try {
    // Check if user already exists in database
    dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
      with: {
        tenantMembers: {
          with: {
            tenant: true,
          },
        },
      },
    });

    // If user has tenants, redirect to first tenant dashboard
    if (dbUser && dbUser.tenantMembers.length > 0) {
      const firstTenant = dbUser.tenantMembers[0].tenant;
      redirect(`/dashboard/${firstTenant.slug}`);
    }
  } catch (error) {
    console.error("Onboarding database error:", error);
    // Continue to show onboarding form even if database fails
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Bienvenue sur ORIZON
          </h1>
          <p className="text-muted-foreground">
            Créez votre premier événement pour commencer
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <OnboardingForm user={dbUser} />
        </div>
      </div>
    </div>
  );
}
