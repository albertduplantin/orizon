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
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Bienvenue sur ORIZON
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            La plateforme tout-en-un pour organiser vos événements et festivals
          </p>

          {/* Value propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-semibold mb-1">Communication simplifiée</h3>
              <p className="text-sm text-muted-foreground">
                Gérez vos équipes avec des canaux de discussion en temps réel
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Gestion des bénévoles</h3>
              <p className="text-sm text-muted-foreground">
                Organisez et coordonnez vos équipes efficacement
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">Modules personnalisables</h3>
              <p className="text-sm text-muted-foreground">
                Activez uniquement les fonctionnalités dont vous avez besoin
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Créez votre premier événement</h2>
          <p className="text-center text-muted-foreground mb-6">
            Commencez en quelques clics - vous pourrez tout personnaliser plus tard
          </p>
          <OnboardingForm user={dbUser} />
        </div>

        {/* Link to pricing */}
        <p className="text-center text-sm text-muted-foreground">
          Vous commencez avec le plan gratuit.{" "}
          <a href="/pricing" className="text-primary hover:underline font-medium">
            Voir tous les plans
          </a>
        </p>
      </div>
    </div>
  );
}
