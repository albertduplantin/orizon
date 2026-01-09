import { requireSuperAdmin } from "@/lib/admin/auth";
import { db } from "@/db";
import { tenants, tenantMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MemberProfileEditor } from "@/components/admin/member-profile-editor";

interface PageProps {
  params: Promise<{ tenantId: string; memberId: string }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  await requireSuperAdmin();

  const { tenantId, memberId } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    redirect("/admin/tenants");
  }

  // Get member with user info
  const member = await db
    .select({
      id: tenantMembers.id,
      userId: tenantMembers.userId,
      role: tenantMembers.role,
      clearanceLevel: tenantMembers.clearanceLevel,
      joinedAt: tenantMembers.joinedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(tenantMembers)
    .leftJoin(users, eq(tenantMembers.userId, users.id))
    .where(eq(tenantMembers.id, memberId))
    .limit(1);

  if (!member || member.length === 0) {
    redirect(`/admin/tenants/${tenantId}/members`);
  }

  const memberData = member[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/admin/tenants/${tenantId}/members`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux membres
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Profil du membre</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="font-medium">{memberData.userName || "Utilisateur sans nom"}</span>
              <span>•</span>
              <span>{memberData.userEmail}</span>
            </div>
          </div>

          {/* Profile Editor */}
          <MemberProfileEditor
            tenantId={tenantId}
            memberId={memberId}
            member={memberData}
          />
        </div>
      </div>
    </div>
  );
}
