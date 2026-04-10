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
