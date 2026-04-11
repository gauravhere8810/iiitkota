import { prisma } from "@/lib/prisma";
import { syncResourceStatuses } from "@/lib/resources";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Club ID required" }, { status: 400 });
  }

  // Handle frontend mock users gracefully
  if (clubId === "club-1") {
    const defaultClub = await prisma.club.findFirst();
    if (defaultClub) clubId = defaultClub.id;
  }

  try {
    await syncResourceStatuses();
  } catch (err) {
    console.error("Status sync failed:", err);
  }

  const resources = await prisma.resource.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { name, type, location, clubId } = data;

    if (!name || !type || !clubId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle frontend mock users gracefully
    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        location,
        clubId,
        status: "AVAILABLE",
        qrCode: `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        description: data.description || "Shared community resource.",
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
