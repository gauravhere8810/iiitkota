"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  content: string;
  channel: string;
}

export function useChat(channel?: string, clubId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsConnecting(true);
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);
      
      // Filter by channel if provided
      if (channel) {
        query = query.eq("channel", channel);
      }

      const { data, error } = await query;
      
      if (error && error.code === "42703") {
        // Column doesn't exist yet — fetch all without filter as fallback
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

    // Subscribe to new messages being inserted remotely
    // Create a unique channel for this specific session to avoid collisions
    const subscription = supabase
      .channel(`chat-listener-${channel || "all"}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Filter logic locally for broad subscriptions
          if (!channel || newMsg.channel === channel) {
            console.log("Cloud message received:", newMsg);
            setMessages((current) => {
              // 1. Check if we already have this exact ID
              if (current.some(m => m.id === newMsg.id)) return current;

              // 2. Check for "optimistic" messages that match this new real message
              // Matching criteria: same content, same sender, and has a temp ID
              const optimisticIndex = current.findIndex(m => 
                m.id.startsWith("temp-") && 
                m.content === newMsg.content && 
                m.sender_id === newMsg.sender_id &&
                m.channel === newMsg.channel
              );

              if (optimisticIndex !== -1) {
                // Replace the temporary message with the real one from the DB
                const updated = [...current];
                updated[optimisticIndex] = newMsg;
                return updated;
              }

              return [...current, newMsg];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channel, clubId]);

  const sendMessage = async (sender_id: string, senderName: string, content: string, msgChannel: string = "INFORMAL") => {
    const targetChannel = channel || msgChannel;
    
    try {
      // 1. Primary: Cloud Sync (Supabase)
      const { error } = await supabase.from("chat_messages").insert([
        { 
          sender_id, 
          sender_name: senderName, 
          content, 
          channel: targetChannel,
        }
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
            channel: targetChannel,
            clubId: clubId || "club-1",
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
