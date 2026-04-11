import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { pollId, optionId, userId } = await request.json();

    if (!pollId || !optionId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user has already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: "User has already voted in this poll" }, { status: 409 });
    }

    // Record the vote
    await prisma.pollVote.create({
      data: {
        pollId,
        optionId,
        userId
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
