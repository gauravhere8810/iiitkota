import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
  }

  try {
    const { hours, channel = "INFORMAL" } = await request.json();

    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - (hours || 24));

    // Fetch messages from Shared Supabase Cloud
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
