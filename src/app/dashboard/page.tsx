import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    // Check if user exists in database and has tenants
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
      with: {
        tenantMembers: {
          with: {
            tenant: true,
          },
        },
      },
    });

    // If no user or no tenants, redirect to onboarding
    if (!dbUser || dbUser.tenantMembers.length === 0) {
      redirect("/onboarding");
    }

    // Redirect to first tenant dashboard
    const firstTenant = dbUser.tenantMembers[0].tenant;
    redirect(`/dashboard/${firstTenant.slug}`);
  } catch (error) {
    console.error("Dashboard error:", error);
    // If database error, redirect to onboarding (user might not exist yet)
    redirect("/onboarding");
  }
}
