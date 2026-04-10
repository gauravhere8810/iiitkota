import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Club ID required" }, { status: 400 });
  }

  const memberships = await prisma.membership.findMany({
    where: { clubId, status: "ACTIVE" },
    include: {
      user: true,
    },
    orderBy: { role: "asc" },
  });

  const formattedMembers = memberships.map(m => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    role: m.role,
    joinedAt: m.createdAt,
    bio: m.user.bio,
    skills: m.user.skills
  }));

  return NextResponse.json({ members: formattedMembers });
}
