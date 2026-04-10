"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);
      
      if (data) setMessages(data as ChatMessage[]);
      setIsConnecting(false);
    };

    fetchMessages();

    // Subscribe to new messages being inserted remotely
    const channel = supabase
      .channel("hq-room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (sender_id: string, sender_name: string, content: string) => {
    const { error } = await supabase.from("chat_messages").insert([
      { sender_id, sender_name, content }
    ]);
    if (error) console.error("Error sending message:", error);
  };

  return { messages, sendMessage, isConnecting };
}
