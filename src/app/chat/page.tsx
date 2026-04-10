"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Send, 
  Megaphone, 
  MessageCircle, 
  Lock, 
  MoreVertical, 
  Smile, 
  Plus,
  ArrowRight
} from "lucide-react";
import styles from "./Chat.module.css";
import { clsx } from "clsx";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOfficial?: boolean;
}

export default function ChatPage() {
  const { user, activeClubId } = useAuth();
  const [channel, setChannel] = useState<"INFORMAL" | "FORMAL">("INFORMAL");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const canPostFormal = activeClub?.role === "HEAD" || activeClub?.role === "COORDINATOR";

  useEffect(() => {
    // Mocking messages for demo
    if (channel === "INFORMAL") {
      setMessages([
        { id: "1", sender: "Charlie Dev", content: "Hey anyone up for a late night coding session?", timestamp: "10:30 PM" },
        { id: "2", sender: "Eve Coder", content: "I'm down! In the lab?", timestamp: "10:32 PM" },
        { id: "3", sender: "Charlie Dev", content: "Yep, see ya there.", timestamp: "10:35 PM" },
      ]);
    } else {
      setMessages([
        { id: "101", sender: "Dr. Alice Smith", content: "OFFICIAL: The Coding Lab will be closed for maintenance tomorrow from 2 PM to 5 PM.", timestamp: "09:00 AM", isOfficial: true },
        { id: "102", sender: "Prof. Bob Jones", content: "REMINDER: Annual Membership fees are due by end of this week.", timestamp: "Yesterday", isOfficial: true },
      ]);
    }
  }, [channel]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: user?.name || "Unknown",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfficial: channel === "FORMAL"
    };
    setMessages([...messages, newMessage]);
    setInputText("");
    
    // Simulate real-time feed update for demo logic
    console.log("CHAT_NEW event triggered");
  };

  return (
    <div className={styles.container}>
      <aside className={clsx(styles.chatSidebar, "glass")}>
        <div className={styles.sidebarHeader}>
          <h3>Channels</h3>
        </div>
        <div className={styles.channelList}>
          <button 
            className={clsx(styles.channelBtn, channel === "INFORMAL" && styles.activeChannel)}
            onClick={() => setChannel("INFORMAL")}
          >
            <MessageCircle size={18} />
            <div className={styles.channelInfo}>
              <span className={styles.channelName}>#informal-chat</span>
              <span className={styles.channelStatus}>Public discussion</span>
            </div>
          </button>
          
          <button 
            className={clsx(styles.channelBtn, styles.formalBtn, channel === "FORMAL" && styles.activeFormal)}
            onClick={() => setChannel("FORMAL")}
          >
            <Megaphone size={18} />
            <div className={styles.channelInfo}>
              <span className={styles.channelName}>#announcements</span>
              <span className={styles.channelStatus}>Official updates only</span>
            </div>
            {!canPostFormal && <Lock size={12} className={styles.lockIcon} />}
          </button>
        </div>
      </aside>

      <section className={clsx(styles.chatWindow, "glass")}>
        <header className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <h4>{channel === "INFORMAL" ? "#informal-chat" : "#announcements"}</h4>
            <div className={styles.separator} />
            <span>{channel === "INFORMAL" ? "Casual brainstorming and discussion" : "Official club communications"}</span>
          </div>
          <div className={styles.headerActions}>
            <Search size={18} />
            <MoreVertical size={18} />
          </div>
        </header>

        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div key={msg.id} className={clsx(styles.messageItem, msg.isOfficial && styles.officialMessage)}>
              <div className={styles.messageAvatar}>{msg.sender.charAt(0)}</div>
              <div className={styles.messageContent}>
                <div className={styles.messageMeta}>
                  <span className={styles.messageSender}>{msg.sender}</span>
                  <span className={styles.messageTime}>{msg.timestamp}</span>
                  {msg.isOfficial && <span className={styles.officialBadge}>OFFICIAL</span>}
                </div>
                <div className={styles.messageText}>{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.inputArea}>
          {(channel === "INFORMAL" || canPostFormal) ? (
            <div className={clsx(styles.inputWrapper, "glass")}>
              <button className={styles.attachBtn}><Plus size={20} /></button>
              <input 
                type="text" 
                placeholder={channel === "FORMAL" ? "Broadcasting official message..." : "Message #informal-chat"} 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className={styles.emojiBtn}><Smile size={20} /></button>
              <button className={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
            </div>
          ) : (
            <div className={styles.readOnlyNotice}>
              <Lock size={14} /> Only coordinators and heads can post in this channel.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
