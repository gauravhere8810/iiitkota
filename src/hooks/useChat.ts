"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  content: string;
  channel: string;
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
    // Create a unique channel for this specific session to avoid collisions
    const subscription = supabase
      .channel(`chat-listener-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("Cloud message received:", payload.new);
          setMessages((current) => {
            // Check for duplicates to prevent double-rendering during optimistic loads
            if (current.some(m => m.id === payload.new.id)) return current;
            return [...current, payload.new as ChatMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const sendMessage = async (sender_id: string, senderName: string, content: string, channel: string = "INFORMAL") => {
    try {
      // 1. Primary: Cloud Sync (Supabase)
      const { error } = await supabase.from("chat_messages").insert([
        { sender_id, sender_name: senderName, content, channel }
      ]);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      console.warn("Cloud sync unavailable, falling back to local Prisma storage.", e);
      
      // 2. Secondary: Local Storage (Prisma API from Main branch)
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            channel: "hq-room",
            clubId: "club-1",
            userId: sender_id,
            userName: senderName
          })
        });
      } catch (localErr) {
        console.error("Critical failure: Both Cloud and Local storage failed.", localErr);
      }
    }
  };

  return { messages, sendMessage, isConnecting, setMessages };
}
