import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Club ID required" }, { status: 400 });
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
    const { name, type, location, clubId } = data;

    if (!name || !type || !clubId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
