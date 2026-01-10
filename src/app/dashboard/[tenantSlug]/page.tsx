import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants, tenantMembers, users, volunteers, volunteerMissions } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getUserModules } from "@/lib/modules";
import { getUserClearance } from "@/lib/permissions";
import { ClearanceBadge } from "@/components/admin/clearance-badge";
import { ModulesGrid } from "@/components/dashboard/modules-grid";
import type { ClearanceLevel } from "@/lib/clearance";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function TenantDashboardPage({ params }: PageProps) {
  const user = await currentUser();
  const { tenantSlug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  // Get tenant and check user has access
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
    with: {
      modules: true,
    },
  });

  if (!tenant) {
    redirect("/dashboard");
  }

  // Check if user is a member of this tenant
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  // If user doesn't exist in DB, create them (webhook might have failed)
  if (!dbUser) {
    console.log("[TENANT DASHBOARD] User not in DB, creating from Clerk data...");
    const newUsers = await db.insert(users).values({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      image: user.imageUrl || null,
      phone: user.phoneNumbers?.[0]?.phoneNumber || null,
    }).returning();
    dbUser = newUsers[0];
    console.log("[TENANT DASHBOARD] User created:", dbUser.id);
  }

  const member = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.tenantId, tenant.id),
      eq(tenantMembers.userId, dbUser.id)
    ),
  });

  if (!member) {
    redirect("/dashboard");
  }

  // Get user's clearance level
  const userClearanceLevel = await getUserClearance(dbUser.id, tenant.id);

  // Get modules accessible to this user (filtered by clearance)
  const accessibleModules = await getUserModules(tenant.id, userClearanceLevel);

  // Get counts
  const volunteersCountResult = await db
    .select({ count: count() })
    .from(volunteers)
    .where(eq(volunteers.tenantId, tenant.id));

  const missionsCountResult = await db
    .select({ count: count() })
    .from(volunteerMissions)
    .where(eq(volunteerMissions.tenantId, tenant.id));

  const volunteersCount = volunteersCountResult[0]?.count ?? 0;
  const missionsCount = missionsCountResult[0]?.count ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{tenant.name}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {member.role === "tenant_admin" ? "Administrateur" : "Membre"}
                </span>
                <ClearanceBadge level={userClearanceLevel as ClearanceLevel} />
              </div>
              {tenant.description && (
                <p className="text-muted-foreground">{tenant.description}</p>
              )}
              {tenant.eventStartDate && tenant.eventEndDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(tenant.eventStartDate).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(tenant.eventEndDate).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Bénévoles</h3>
              <p className="text-3xl font-bold">{volunteersCount}</p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Missions</h3>
              <p className="text-3xl font-bold">{missionsCount}</p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Modules accessibles</h3>
              <p className="text-3xl font-bold">{accessibleModules.length}</p>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Modules disponibles</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Les modules sont filtrés selon votre niveau d'accréditation Rainbow
              </p>
              <ModulesGrid
                modules={accessibleModules}
                tenantSlug={tenantSlug}
                userClearance={userClearanceLevel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
