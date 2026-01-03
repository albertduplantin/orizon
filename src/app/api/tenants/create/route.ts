import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, tenants, tenantMembers, tenantModules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { provisionModuleChannels } from "@/lib/communication/channel-provisioning";

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
    console.log("=== Starting tenant creation ===");

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("Authentication failed - no user");
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", userId);

    const body = await req.json();
    const { name, description, eventStartDate, eventEndDate } = body;

    if (!name || name.trim().length === 0) {
      console.error("Validation failed - no name");
      return NextResponse.json(
        { error: "Le nom de l'événement est requis" },
        { status: 400 }
      );
    }

    console.log("Creating tenant with name:", name);

    // Generate unique slug
    let slug = generateSlug(name);
    console.log("Generated slug:", slug);

    let slugExists = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await db.query.tenants.findFirst({
        where: eq(tenants.slug, slug),
      });
      counter++;
    }

    console.log("Final slug:", slug);

    // Ensure user exists in database
    console.log("Checking if user exists in database...");
    let dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      console.log("User not found in database, creating...");
      const newUsers = await db.insert(users).values({
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        image: user.imageUrl || null,
        phone: user.phoneNumbers?.[0]?.phoneNumber || null,
      }).returning();
      dbUser = newUsers[0];
      console.log("User created:", dbUser.id);
    } else {
      console.log("User found in database:", dbUser.id);
    }

    // Create tenant
    console.log("Creating tenant...");
    const newTenants = await db.insert(tenants).values({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
      eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
    }).returning();
    const tenant = newTenants[0];

    console.log("Tenant created:", tenant.id);

    // Add user as tenant admin
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      userId: dbUser.id,
      role: "tenant_admin",
    });

    console.log("Tenant member added");

    // Activate volunteers module
    await db.insert(tenantModules).values({
      tenantId: tenant.id,
      moduleId: "volunteers",
      enabled: true,
      billingStatus: "granted",
    });

    console.log("Volunteers module activated");

    // Activate Communication module
    await db.insert(tenantModules).values({
      tenantId: tenant.id,
      moduleId: "communication",
      enabled: true,
      billingStatus: "granted",
    });

    console.log("Communication module activated");

    // Auto-provision Communication channels
    const channels = await provisionModuleChannels(
      tenant.id,
      "communication",
      dbUser.id
    );

    console.log(`Created ${channels.length} communication channels`);
    console.log("Tenant created successfully:", tenant.id);

    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return NextResponse.json(
      {
        error: "Erreur lors de la création de l'événement",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
