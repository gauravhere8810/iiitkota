import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Club ID required" }, { status: 400 });
  }

  const [memberCount, activeResources, upcomingEvents, recentAnnouncements, pendingRequests] = await Promise.all([
    prisma.membership.count({ where: { clubId, status: "ACTIVE" } }),
    prisma.resource.count({ where: { clubId, status: "AVAILABLE" } }),
    prisma.event.findMany({ 
      where: { clubId, startTime: { gte: new Date() } },
      take: 4,
      orderBy: { startTime: "asc" }
    }),
    prisma.announcement.findMany({
      where: { clubId },
      take: 3,
      orderBy: { createdAt: "desc" }
    }),
    prisma.resourceBooking.count({
      where: { resource: { clubId }, status: "PENDING" }
    })
  ]);

  return NextResponse.json({
    memberCount,
    activeResources,
    upcomingEvents,
    recentAnnouncements,
    pendingRequests
  });
}
