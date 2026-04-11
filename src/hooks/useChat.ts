"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  content: string;
  channel?: string;
}

export function useChat(channel?: string, clubId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsConnecting(true);
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);
      
      // Filter by channel if column exists
      if (channel) {
        query = query.eq("channel", channel);
      }

      const { data, error } = await query;
      
      if (error && error.code === "42703") {
        // Column doesn't exist yet — fetch all without filter
        const { data: allData } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(50);
        if (allData) setMessages(allData as ChatMessage[]);
      } else if (data) {
        setMessages(data as ChatMessage[]);
      }
      setIsConnecting(false);
    };

    fetchMessages();

    // Subscribe to new messages in real-time
    const sub = supabase
      .channel(`chat-${channel || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Only add if matching channel (or no channel filter)
          if (!channel || newMsg.channel === channel || !newMsg.channel) {
            setMessages((current) => {
              if (current.some(m => m.id === newMsg.id)) return current;
              return [...current, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [channel, clubId]);

  const sendMessage = useCallback(async (sender_id: string, sender_name: string, content: string) => {
    const insertData: Record<string, string> = { sender_id, sender_name, content };
    if (channel) insertData.channel = channel;
    
    const { error } = await supabase.from("chat_messages").insert([insertData]);
    if (error) console.error("Error sending message:", error);
  }, [channel]);

  return { messages, sendMessage, isConnecting };
}
