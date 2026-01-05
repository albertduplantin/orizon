import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Vérifie que l'utilisateur connecté est un super admin
 * Redirige vers /dashboard si non autorisé
 */
export async function requireSuperAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser || dbUser.role !== "super_admin") {
    redirect("/dashboard");
  }

  return dbUser;
}

/**
 * Vérifie si l'utilisateur est un super admin (sans redirection)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) return false;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  return dbUser?.role === "super_admin";
}
