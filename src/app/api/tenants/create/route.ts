import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, eventStartDate, eventEndDate } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom de l'événement est requis" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    // Ensure user exists in database (should be created by webhook, but check anyway)
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      // Create user if not exists (fallback if webhook hasn't processed yet)
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
          image: user.imageUrl || null,
          phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        },
      });
    }

    // Create tenant with the user as tenant_admin
    const tenant = await prisma.tenant.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        members: {
          create: {
            userId: dbUser.id,
            role: "tenant_admin",
          },
        },
        // Activate the volunteers module by default for MVP
        modules: {
          create: {
            moduleId: "volunteers",
            enabled: true,
            billingStatus: "granted",
          },
        },
      },
    });

    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}
