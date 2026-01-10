import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { volunteerMissions, tenantMembers, users } from "@/db/schema";
import { eq, and, desc, asc, gte, lte, or, like, count } from "drizzle-orm";

// GET - List missions with filtering
export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId requis" },
        { status: 400 }
      );
    }

    // Check if user is a member of the tenant
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Build query conditions
    const conditions = [eq(volunteerMissions.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(volunteerMissions.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(volunteerMissions.title, `%${search}%`),
          like(volunteerMissions.description, `%${search}%`)
        )!
      );
    }

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(volunteerMissions)
      .where(and(...conditions));

    // Get missions with assignments
    const orderByColumn = sortBy === "startDate"
      ? volunteerMissions.startDate
      : volunteerMissions.createdAt;
    const orderByDirection = sortOrder === "asc" ? asc : desc;

    const missions = await db.query.volunteerMissions.findMany({
      where: and(...conditions),
      with: {
        assignments: {
          with: {
            volunteer: {
              with: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: [orderByDirection(orderByColumn)],
      limit,
      offset,
    });

    return NextResponse.json({
      missions,
      pagination: {
        total: totalCount?.count || 0,
        limit,
        offset,
        hasMore: (totalCount?.count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des missions" },
      { status: 500 }
    );
  }
}

// POST - Create a new mission
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
    const {
      tenantId,
      title,
      description,
      requiredCount,
      status,
      startDate,
      endDate,
      location,
    } = body;

    // Validate required fields
    if (!tenantId || !title) {
      return NextResponse.json(
        { error: "tenantId et title sont requis" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["draft", "published", "in_progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Validate dates
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: "La date de début doit être antérieure à la date de fin" },
        { status: 400 }
      );
    }

    // Get user and check permissions
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.userId, dbUser.id)
      ),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Check clearance level (min YELLOW/3 required)
    if (member.clearanceLevel < 3) {
      return NextResponse.json(
        { error: "Permission insuffisante (clearance YELLOW minimum requise)" },
        { status: 403 }
      );
    }

    // Create mission
    const result = await db
      .insert(volunteerMissions)
      .values({
        tenantId,
        title,
        description: description || null,
        requiredCount: requiredCount || 1,
        status: status || "draft",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        createdBy: dbUser.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      mission: result[0],
    });
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la mission" },
      { status: 500 }
    );
  }
}
