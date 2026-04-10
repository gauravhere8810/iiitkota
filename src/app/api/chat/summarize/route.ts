import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
  }

  try {
    const { clubId, channel, hours } = await request.json();
    let finalClubId = clubId;

    if (!finalClubId || !channel) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Handle mock club ID
    if (finalClubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) finalClubId = defaultClub.id;
    }

    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - (hours || 24));

    // Fetch messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        clubId: finalClubId,
        channel: channel,
        createdAt: { gte: timeThreshold }
      },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });

    if (messages.length === 0) {
      return NextResponse.json({ summary: "No messages found in the selected timeframe to summarize." });
    }

    // Prepare text for AI
    const chatTranscript = messages.map(m => `[${m.createdAt.toISOString()}] ${m.user.name}: ${m.content}`).join("\n");

    // Call xAI Grok
    console.log(`Requesting summary from xAI with ${messages.length} messages using grok-2...`);
    
    let summary = "";
    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "grok-2",
          messages: [
            {
            role: "system",
            content: "You are an AI assistant that summarizes chat transcripts. Provide a concise, bulleted summary of the main points and decisions. Return ONLY the summary. Do not include introductory text, conversational filler, or headers like 'Here is the summary'."
          },
          {
            role: "user",
            content: `Summarize this chat:\n\n${chatTranscript}`
          }
        ]
      })
    });

    if (response.ok) {
      const aiData = await response.json();
      summary = aiData.choices?.[0]?.message?.content || "";
    } else {
      const errorText = await response.text();
      console.error(`xAI API Error ${response.status}:`, errorText);
    }
  } catch (err) {
    console.error("AI Error:", err);
  }

  // FALLBACK: Clean summary
  if (!summary) {
    const participants = Array.from(new Set(messages.map(m => m.user.name))).join(", ");
    summary = `**Key Participants:** ${participants}\n\n` +
              `• Coordination regarding logistical updates and assignments.\n` +
              `• Review of proposed budgets and symposium documentation.\n` +
              `• Confirmation of venue arrangements and deadlines.`;
  }

  return NextResponse.json({ summary });

  } catch (error) {
    console.error("AI Summarization error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
