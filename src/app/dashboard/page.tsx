import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user exists in database and has tenants
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      tenantMembers: {
        include: {
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
}
