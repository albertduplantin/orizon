import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { InviteCodeGenerator } from "@/components/volunteers/invite-code-generator";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function InviteVolunteersPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      members: {
        where: {
          user: {
            clerkId: user.id,
          },
        },
      },
      inviteCodes: {
        where: {
          moduleId: "volunteers",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!tenant || tenant.members.length === 0) {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-foreground">
              {tenant.name}
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/${tenantSlug}/volunteers`}
              className="hover:text-foreground"
            >
              Bénévoles
            </Link>
            <span>/</span>
            <span>Inviter</span>
          </div>
          <h1 className="text-3xl font-bold">Inviter des bénévoles</h1>
          <p className="text-muted-foreground mt-2">
            Créez un code d&apos;invitation unique à partager avec vos futurs bénévoles
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generate New Code */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Créer un nouveau code</h2>
            <InviteCodeGenerator tenantId={tenant.id} userId={dbUser.id} />
          </div>

          {/* Existing Codes */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Codes d&apos;invitation actifs</h2>
            {tenant.inviteCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun code d&apos;invitation créé
              </div>
            ) : (
              <div className="space-y-3">
                {tenant.inviteCodes.map((inviteCode) => {
                  const isExpired =
                    inviteCode.expiresAt && inviteCode.expiresAt < new Date();
                  const isMaxed = inviteCode.uses >= inviteCode.maxUses;

                  return (
                    <div
                      key={inviteCode.id}
                      className={`p-4 border rounded-lg ${
                        isExpired || isMaxed ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <code className="text-2xl font-bold tracking-wider">
                          {inviteCode.code}
                        </code>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isExpired || isMaxed
                              ? "bg-gray-100 text-gray-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isExpired
                            ? "Expiré"
                            : isMaxed
                            ? "Utilisé"
                            : "Actif"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Utilisations : {inviteCode.uses}/{inviteCode.maxUses}
                        </p>
                        {inviteCode.expiresAt && (
                          <p>
                            Expire le :{" "}
                            {new Date(inviteCode.expiresAt).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                        <p>
                          Créé le :{" "}
                          {new Date(inviteCode.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {!isExpired && !isMaxed && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">
                            Lien d&apos;invitation :
                          </p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block overflow-x-auto">
                            {typeof window !== "undefined"
                              ? window.location.origin
                              : "https://orizon.app"}
                            /join/{inviteCode.code}
                          </code>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="glass-card p-6 rounded-xl mt-8">
          <h2 className="text-lg font-semibold mb-3">Comment ça marche ?</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Créez un code d&apos;invitation avec les paramètres souhaités</li>
            <li>2. Partagez le code ou le lien avec vos futurs bénévoles</li>
            <li>
              3. Ils s&apos;inscriront automatiquement et seront ajoutés à votre liste
              de bénévoles
            </li>
            <li>
              4. Vous pourrez ensuite approuver ou rejeter leur candidature depuis la
              page Bénévoles
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
