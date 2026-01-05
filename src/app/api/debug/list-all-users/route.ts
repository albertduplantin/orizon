import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
