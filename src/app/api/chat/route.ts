import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let clubId = searchParams.get("clubId");
    const channel = searchParams.get("channel");

    if (!clubId || !channel) {
      return NextResponse.json({ error: "Club ID and channel required" }, { status: 400 });
    }

    // Handle mock club ID
    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    let messages = await prisma.chatMessage.findMany({
      where: { clubId, channel },
      include: { user: true },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    // AUTO-SEED Logic
    if (messages.length === 0) {
      console.log(`Auto-seeding mock messages for ${channel}...`);
      const defaultUser = await prisma.user.findFirst() || await prisma.user.create({
        data: { id: "seed-user", name: "System Admin", email: "admin@uni.edu" }
      });
      
      const seedData = channel === "INFORMAL" ? [
        "Hey anyone up for a late night coding session?",
        "I'm down! In the lab?",
        "Yep, see ya there."
      ] : [
        "Let's review the finalized budget for the tech symposium.",
        "Agreed. I will upload the Excel spec sheet soon.",
        "Quick update: The venue has been confirmed for the Innovation Hall."
      ];

      for (const content of seedData) {
        await prisma.chatMessage.create({
          data: { content, channel, clubId, userId: defaultUser.id }
        });
      }

      messages = await prisma.chatMessage.findMany({
        where: { clubId, channel },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        sender: msg.user.name,
        content: msg.content,
        timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: msg.channel
      }))
    });
  } catch (error) {
    console.error("Fetch chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { content, channel, clubId, userId, userName } = data;

    if (!content || !channel || !clubId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (clubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) clubId = defaultClub.id;
    }

    let finalUserId = userId;
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!existingUser) {
      const email = data.userEmail || `${userId}@mock.uni.edu`;
      const userByEmail = await prisma.user.findUnique({ where: { email } });
      
      if (userByEmail) {
        finalUserId = userByEmail.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            name: userName || "Mock User",
            email: email,
          }
        });
        finalUserId = newUser.id;
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        channel,
        clubId,
        userId: finalUserId,
      },
      include: { user: true }
    });

    return NextResponse.json({
      message: {
        id: message.id,
        sender: message.user.name,
        content: message.content,
        timestamp: message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: message.channel
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Save chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
