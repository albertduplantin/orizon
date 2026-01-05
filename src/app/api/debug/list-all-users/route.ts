import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
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

    const allUsers = await db.select().from(users);

    return NextResponse.json({
      count: allUsers.length,
      users: allUsers.map(u => ({
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "Error listing users" }, { status: 500 });
  }
}
