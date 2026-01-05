import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Update the current user to super_admin
    const result = await db
      .update(users)
      .set({ role: "super_admin" })
      .where(eq(users.clerkId, userId))
      .returning();

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "User updated to super_admin",
        user: {
          id: result[0].id,
          email: result[0].email,
          role: result[0].role,
        },
      });
    } else {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error updating user" },
      { status: 500 }
    );
  }
}
