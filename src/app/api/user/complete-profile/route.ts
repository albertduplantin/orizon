import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, email, phone } = body;

    // Verify that the user is updating their own profile
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!dbUser || dbUser.clerkId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Au moins un champ doit être fourni" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !/^[+]?[\d\s\-().]+$/.test(phone)) {
      return NextResponse.json(
        { error: "Format de téléphone invalide" },
        { status: 400 }
      );
    }

    // Check if email is already used by another user
    if (email && email !== dbUser.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (email) {
      updateData.email = email;
    }

    if (phone) {
      updateData.phone = phone;
    }

    // Update user in database
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // Also update Clerk user metadata to keep them in sync
    const clerk = await clerkClient();
    try {
      if (phone) {
        await clerk.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            phoneNumber: phone,
          },
        });
      }
    } catch (clerkError) {
      console.error("Error updating Clerk user:", clerkError);
      // Don't fail the request if Clerk update fails, DB is source of truth
    }

    return NextResponse.json({
      success: true,
      user: result[0],
    });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
