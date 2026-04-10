import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch pending resource requests for a club
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Club ID required" }, { status: 400 });
  }

  if (clubId === "club-1") {
    const defaultClub = await prisma.club.findFirst();
    if (defaultClub) clubId = defaultClub.id;
  }

  try {
    // Get all resources for this club, then get bookings
    const resources = await prisma.resource.findMany({
      where: { clubId },
      select: { id: true, name: true }
    });

    const resourceIds = resources.map(r => r.id);

    const bookings = await prisma.resourceBooking.findMany({
      where: {
        resourceId: { in: resourceIds },
        status: "PENDING"
      },
      include: {
        user: true,
        resource: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      requests: bookings.map(b => ({
        id: b.id,
        resourceId: b.resourceId,
        resourceName: b.resource.name,
        requesterName: b.user.name,
        reason: b.notes || "No reason provided",
        status: b.status,
        createdAt: b.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Submit a new resource request
export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { resourceId, clubId, userId, userName, userEmail, reason } = data;

    if (!resourceId || !clubId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    // Handle mock user
    let finalUserId = userId;
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      const email = userEmail || `${userId}@mock.uni.edu`;
      const userByEmail = await prisma.user.findUnique({ where: { email } });
      if (userByEmail) {
        finalUserId = userByEmail.id;
      } else {
        const newUser = await prisma.user.create({
          data: { id: userId, name: userName || "Member", email }
        });
        finalUserId = newUser.id;
      }
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        resourceId,
        userId: finalUserId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
        status: "PENDING",
        notes: reason
      }
    });

    return NextResponse.json({ request: booking }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Approve or reject a resource request
export async function PATCH(request: Request) {
  try {
    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (action !== "APPROVED" && action !== "REJECTED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.resourceBooking.update({
      where: { id: requestId },
      data: { status: action }
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
