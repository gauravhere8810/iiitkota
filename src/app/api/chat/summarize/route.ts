import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function localSummarize(messages: Array<{ user: { name: string }; content: string; createdAt: Date }>, channel: string): string {
  const participants = Array.from(new Set(messages.map(m => m.user.name)));
  
  // Group messages by participant
  const byParticipant: Record<string, string[]> = {};
  for (const m of messages) {
    if (!byParticipant[m.user.name]) byParticipant[m.user.name] = [];
    byParticipant[m.user.name].push(m.content);
  }

  // Extract key words
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "need", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "between", "out", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "because", "but", "and", "or", "if", "while", "about", "up", "it", "its", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "they", "them", "their", "this", "that", "these", "those", "what", "which", "who", "whom", "lets", "let", "yeah", "yep", "hey", "okay", "sure", "think", "like", "know", "going", "also", "well", "down", "been"]);
  
  const wordFreq: Record<string, number> = {};
  const allText = messages.map(m => m.content).join(" ").toLowerCase();
  allText.split(/\W+/).forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const topTopics = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // Build time range
  const earliest = messages[0].createdAt;
  const latest = messages[messages.length - 1].createdAt;
  const timeRange = `${earliest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${latest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Build summary
  let summary = `📋 Summary of ${messages.length} messages in #${channel.toLowerCase()} (${timeRange})\n\n`;
  
  summary += `👥 Participants: ${participants.join(", ")}\n\n`;
  
  if (topTopics.length > 0) {
    summary += `🔑 Key Topics: ${topTopics.join(", ")}\n\n`;
  }

  summary += `💬 Key Points:\n`;
  // Pick the most substantial messages (longest = most informative)
  const substantialMessages = [...messages]
    .sort((a, b) => b.content.length - a.content.length)
    .slice(0, Math.min(5, messages.length));
  
  // Re-sort by time
  substantialMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  for (const m of substantialMessages) {
    summary += `• ${m.user.name}: ${m.content}\n`;
  }

  summary += `\n📊 Activity: ${participants.map(p => `${p} (${byParticipant[p].length} msgs)`).join(", ")}`;

  return summary;
}

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;

  try {
    const { clubId, channel, hours } = await request.json();
    let finalClubId = clubId;

    if (!finalClubId || !channel) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (finalClubId === "club-1") {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) finalClubId = defaultClub.id;
    }

    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - (hours || 24));

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
      return NextResponse.json({ summary: "No messages found in the selected timeframe." });
    }

    const chatTranscript = messages.map(m => `${m.user.name}: ${m.content}`).join("\n");

    // Try xAI first
    let summary = "";
    if (apiKey) {
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
                content: "Summarize this chat transcript. Return ONLY bullet points of key discussion points and decisions. No intro or outro text."
              },
              {
                role: "user",
                content: chatTranscript
              }
            ]
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          summary = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error("xAI Error:", err);
      }
    }

    // Fallback: Smart local summarizer
    if (!summary) {
      summary = localSummarize(messages, channel);
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
