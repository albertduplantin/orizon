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

  console.log("[DASHBOARD] Checking user:", user.id, user.emailAddresses[0]?.emailAddress);

  // Check if user exists in database and has tenants
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
    with: {
      tenantMembers: {
        with: {
          tenant: true,
        },
      },
    },
  });

  // If user doesn't exist in DB, create them (webhook might have failed)
  if (!dbUser) {
    console.log("[DASHBOARD] User not in DB, creating from Clerk data...");
    await db.insert(users).values({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      image: user.imageUrl || null,
      phone: user.phoneNumbers?.[0]?.phoneNumber || null,
    });

    // Fetch again with relations
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
    console.log("[DASHBOARD] User created in DB:", dbUser?.id);
  }

  console.log("[DASHBOARD] DB User found:", !!dbUser);
  console.log("[DASHBOARD] Tenants count:", dbUser?.tenantMembers.length || 0);

  // If no tenants, redirect to onboarding
  if (!dbUser || dbUser.tenantMembers.length === 0) {
    console.log("[DASHBOARD] Redirecting to onboarding - no tenants");
    redirect("/onboarding");
  }

  // Redirect to first tenant dashboard
  const firstTenant = dbUser.tenantMembers[0].tenant;
  const targetUrl = `/dashboard/${firstTenant.slug}`;
  console.log("[DASHBOARD] About to redirect to:", targetUrl);
  console.log("[DASHBOARD] User has", dbUser.tenantMembers.length, "tenant(s)");
  redirect(targetUrl);
}
