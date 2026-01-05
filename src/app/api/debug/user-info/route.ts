import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    // Only super admins can access debug endpoints
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé - accès réservé aux super admins" },
        { status: 403 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ error: "Error fetching user info" }, { status: 500 });
  }
}
