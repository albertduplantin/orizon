import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue sur ORIZON
              </h1>
              <p className="text-muted-foreground">
                Bonjour {user.firstName || user.emailAddresses[0].emailAddress} !
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">
                Tableau de bord
              </h2>
              <p className="text-sm text-muted-foreground">
                Votre plateforme de gestion d&apos;événements est prête. Les fonctionnalités seront ajoutées prochainement.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-1">Événements</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-1">Bénévoles</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-1">Tâches</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
