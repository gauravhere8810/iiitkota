import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: {
          club: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Format response for frontend
  const formattedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    clubs: user.memberships.map((m) => ({
      id: m.clubId,
      name: m.club.name,
      role: m.role,
    })),
  };

  return NextResponse.json({ user: formattedUser });
}
