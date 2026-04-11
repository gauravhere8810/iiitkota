import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

function localSummarize(messages: any[], channel: string): string {
  const participants = Array.from(new Set(messages.map(m => m.sender_name)));
  
  // Group messages by participant
  const byParticipant: Record<string, string[]> = {};
  for (const m of messages) {
    if (!byParticipant[m.sender_name]) byParticipant[m.sender_name] = [];
    byParticipant[m.sender_name].push(m.content);
  }

  // Extract key words
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "need", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "between", "out", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "because", "but", "and", "or", "if", "while", "about", "up", "it", "its", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "they", "them", "their", "this", "that", "these", "those", "what", "which", "who", "whom", "lets", "let", "yeah", "yep", "hey", "okay", "sure", "think", "like", "know", "going", "also", "well", "down", "been"]);
  
  const wordFreq: Record<string, number> = {};
  messages.forEach(m => {
    m.content.toLowerCase().split(/\W+/).forEach((word: string) => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
  });
  
  const topTopics = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  // Build summary
  let summary = `📋 [Fallback Summary] #${channel.toLowerCase()} Coordination (${messages.length} messages)\n\n`;
  
  summary += `👥 Participants: ${participants.join(", ")}\n\n`;
  
  if (topTopics.length > 0) {
    summary += `🎯 Primary Focus: ${topTopics.join(", ")}\n\n`;
  }

  summary += `📝 Highlights:\n`;
  const counts: Record<string, number> = {};
  messages.forEach(m => counts[m.sender_name] = (counts[m.sender_name] || 0) + 1);
  const mainContributor = Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];

  summary += `• Discussion centered around ${topTopics[0] || 'active coordination'} and related topics.\n`;
  summary += `• ${mainContributor} provided the most significant input during this period.\n`;
  summary += `• The team exchanged ${Math.round(messages.length / participants.length)} points per person on average.\n`;
  summary += `• Conversation concluded with a focus on ${topTopics[1] || 'current goals'}.\n`;

  return summary;
}

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;

  try {
    const { clubId, channel = "INFORMAL", hours = 24 } = await request.json();
    let finalClubId = clubId;

    if (finalClubId === "club-1" || !finalClubId) {
      const defaultClub = await prisma.club.findFirst();
      if (defaultClub) finalClubId = defaultClub.id;
    }

    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - hours);

    // Fetch messages from Shared Supabase Cloud for real-time consistency
    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("channel", channel)
      .gte("created_at", timeThreshold.toISOString())
      .order("created_at", { ascending: true });
    
    const { data: messages, error: sbError } = await query;

    if (sbError || !messages) {
      console.error("Supabase fetch error for AI:", sbError);
      return NextResponse.json({ error: "Failed to retrieve coordination logs" }, { status: 500 });
    }

    if (messages.length === 0) {
      return NextResponse.json({ summary: "No recent coordination logs found to summarize." });
    }

    // Prepare text for AI
    const chatTranscript = messages.map(m => `[${m.created_at}] ${m.sender_name}: ${m.content}`).join("\n");

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
                content: "Synthesize this chat transcript into a concise executive summary for a leadership team. Focus on outcomes and resolved points. Do NOT include raw quotes or dialogue. Instead, synthesize the core meaning. Return ONLY bullet points grouped by 'Decisions', 'Key Discussions', and 'Action Items'. No intro or outro text."
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
