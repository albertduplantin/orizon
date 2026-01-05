import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ role: null, isSuperAdmin: false }, { status: 200 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: {
        role: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ role: null, isSuperAdmin: false }, { status: 200 });
    }

    return NextResponse.json({
      role: dbUser.role,
      isSuperAdmin: dbUser.role === "super_admin",
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ role: null, isSuperAdmin: false }, { status: 200 });
  }
}
