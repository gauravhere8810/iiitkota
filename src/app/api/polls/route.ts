import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let clubId = searchParams.get("clubId");
    const userId = searchParams.get("userId");

    if (!clubId || !userId) {
      return NextResponse.json({ error: "clubId and userId required" }, { status: 400 });
    }

    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    const polls = await prisma.poll.findMany({
      where: { clubId },
      include: {
        options: {
          include: { _count: { select: { votes: true } } }
        },
        votes: {
          where: { userId }
        },
        _count: { select: { votes: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedPolls = polls.map(poll => {
      const hasVoted = poll.votes.length > 0;
      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        totalVotes: poll._count.votes,
        expiresAt: poll.expiresAt.toISOString().split("T")[0],
        hasVoted,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt._count.votes
        }))
      };
    });

    return NextResponse.json({ polls: formattedPolls });
  } catch (error) {
    console.error("Fetch polls error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { clubId, userId, userRole, title, description, options, expiresAt } = body;

    if (!clubId || !userId || !title || !options || options.length < 2) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role Based Access Control
    if (userRole === "STUDENT") {
      return NextResponse.json({ error: "Forbidden: Students cannot create polls" }, { status: 403 });
    }

    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        authorId: userId,
        clubId,
        expiresAt: new Date(expiresAt),
        options: {
          create: options.map((opt: string) => ({ text: opt }))
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json({ success: true, poll }, { status: 201 });
  } catch (error) {
    console.error("Create poll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
