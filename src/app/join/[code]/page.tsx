import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { validateInviteCode, useInviteCode } from "@/lib/invite-codes";
import { db } from "@/db";
import { tenants, users, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function JoinWithCodePage({ params }: PageProps) {
  const user = await currentUser();
  const { code } = await params;

  // If not authenticated, redirect to sign-in with return URL
  if (!user) {
    redirect(`/sign-in?redirect_url=/join/${code}`);
  }

  // Validate the invite code
  const validation = await validateInviteCode(code);

  if (!validation.valid || !validation.tenantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Code invalide</h1>
          <p className="text-muted-foreground mb-6">
            Ce code d&apos;invitation est invalide, expiré ou a déjà été utilisé.
          </p>
          <Link href="/dashboard">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get tenant information
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, validation.tenantId),
  });

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Événement introuvable</h1>
          <p className="text-muted-foreground mb-6">
            L&apos;événement associé à ce code n&apos;existe plus.
          </p>
          <Link href="/dashboard">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get or create user in database
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!dbUser) {
    const [newUser] = await db.insert(users).values({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      image: user.imageUrl || null,
    }).returning();
    dbUser = newUser;
  }

  // Check if user is already a member
  const existingMember = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.tenantId, tenant.id),
      eq(tenantMembers.userId, dbUser.id)
    ),
  });

  if (existingMember) {
    // Already a member, redirect to tenant dashboard
    redirect(`/dashboard/${tenant.slug}`);
  }

  // Use the invite code (this will add user to tenant)
  try {
    await useInviteCode(code, dbUser.id);
  } catch (error) {
    console.error("Error using invite code:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Erreur</h1>
          <p className="text-muted-foreground mb-6">
            Une erreur est survenue lors de l&apos;utilisation du code.
          </p>
          <Link href="/dashboard">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success! Show confirmation and redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        </div>
        <h1 className="text-2xl font-bold mb-2">Bienvenue !</h1>
        <p className="text-muted-foreground mb-6">
          Vous avez rejoint <strong>{tenant.name}</strong> avec succès.
          {validation.moduleId === "volunteers" &&
            " Votre candidature sera examinée par les organisateurs."}
        </p>
        <Link href={`/dashboard/${tenant.slug}`}>
          <Button className="w-full">Accéder au tableau de bord</Button>
        </Link>
      </div>
    </div>
  );
}
