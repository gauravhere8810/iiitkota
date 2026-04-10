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
  ArrowRight,
  Search,
  FileText
} from "lucide-react";
import styles from "./Chat.module.css";
import { clsx } from "clsx";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOfficial?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

export default function ChatPage() {
  const { user, activeClubId } = useAuth();
  const [channel, setChannel] = useState<"INFORMAL" | "FORMAL" | "ANNOUNCEMENTS">("ANNOUNCEMENTS");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const isTopRole = activeClub?.role === "SAC_HEAD" || activeClub?.role === "SAC_MEMBER" || activeClub?.role === "CLUB_HEAD";
  const isGeneralMember = activeClub?.role === "STUDENT";

  useEffect(() => {
    // General members can only access ANNOUNCEMENTS
    if (isGeneralMember && channel !== "ANNOUNCEMENTS") {
      setChannel("ANNOUNCEMENTS");
    }
    
    // Core members cannot see FORMAL, but can see ANNOUNCEMENTS and INFORMAL
    if (!isTopRole && channel === "FORMAL") {
      setChannel("INFORMAL");
    }
  }, [isGeneralMember, isTopRole, channel]);

  useEffect(() => {
    // Mocking messages for demo
    if (channel === "INFORMAL") {
      setMessages([
        { id: "1", sender: "Charlie Dev", content: "Hey anyone up for a late night coding session?", timestamp: "10:30 PM" },
        { id: "2", sender: "Eve Coder", content: "I'm down! In the lab?", timestamp: "10:32 PM" },
        { id: "3", sender: "Charlie Dev", content: "Yep, see ya there.", timestamp: "10:35 PM" },
      ]);
    } else if (channel === "FORMAL") {
      setMessages([
        { id: "201", sender: "Dr. Alice Smith", content: "Let's review the finalized budget for the tech symposium.", timestamp: "11:00 AM" },
        { id: "202", sender: "Admin Bob", content: "Agreed. I will upload the Excel spec sheet soon.", timestamp: "11:15 AM" },
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
      isOfficial: channel === "ANNOUNCEMENTS"
    };
    setMessages([...messages, newMessage]);
    setInputText("");
    
    // Simulate real-time feed update for demo logic
    console.log("CHAT_NEW event triggered");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: user?.name || "Unknown",
      content: inputText || "Sent a file",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfficial: channel === "ANNOUNCEMENTS",
      fileUrl,
      fileType: file.type,
      fileName: file.name
    };
    
    setMessages([...messages, newMessage]);
    setInputText("");
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <aside className={clsx(styles.chatSidebar, "glass")}>
        <div className={styles.sidebarHeader}>
          <h3>Channels</h3>
        </div>
        <div className={styles.channelList}>
          <button 
            className={clsx(styles.channelBtn, styles.formalBtn, channel === "ANNOUNCEMENTS" && styles.activeFormal)}
            onClick={() => setChannel("ANNOUNCEMENTS")}
          >
            <Megaphone size={18} />
            <div className={styles.channelInfo}>
              <span className={styles.channelName}>#announcements</span>
              <span className={styles.channelStatus}>Official updates only</span>
            </div>
            {!isTopRole && <Lock size={12} className={styles.lockIcon} />}
          </button>

          {!isGeneralMember && (
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
          )}
          
          {isTopRole && (
            <button 
              className={clsx(styles.channelBtn, styles.formalBtn, channel === "FORMAL" && styles.activeFormal)}
              onClick={() => setChannel("FORMAL")}
            >
              <Lock size={18} />
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>#formal-chat</span>
                <span className={styles.channelStatus}>Leadership group</span>
              </div>
            </button>
          )}
        </div>
      </aside>

      <section className={clsx(styles.chatWindow, "glass")}>
        <header className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <h4>{channel === "INFORMAL" ? "#informal-chat" : channel === "FORMAL" ? "#formal-chat" : "#announcements"}</h4>
            <div className={styles.separator} />
            <span>{channel === "INFORMAL" ? "Casual brainstorming and discussion" : channel === "FORMAL" ? "Leadership group chat" : "Official club communications"}</span>
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
                {msg.fileUrl && (
                  <div className={styles.attachmentContainer}>
                    {msg.fileType?.startsWith('image/') && (
                      <img src={msg.fileUrl} alt="Attached image" className={styles.imageAttachment} />
                    )}
                    {msg.fileType?.startsWith('video/') && (
                      <video src={msg.fileUrl} controls className={styles.videoAttachment} />
                    )}
                    {!msg.fileType?.startsWith('image/') && !msg.fileType?.startsWith('video/') && (
                      <a href={msg.fileUrl} download={msg.fileName} className={styles.documentAttachment}>
                        <FileText size={18} />
                        <span className={styles.documentName}>{msg.fileName || "Document.pdf"}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.inputArea}>
          {(channel !== "ANNOUNCEMENTS") || (channel === "ANNOUNCEMENTS" && isTopRole) ? (
            <div className={clsx(styles.inputWrapper, "glass")}>
              <button className={styles.attachBtn} onClick={() => fileInputRef.current?.click()}>
                <Plus size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className={styles.hiddenInput} 
                accept=".pdf,image/png,image/jpeg,video/*" 
                onChange={handleFileUpload} 
              />
              <input 
                type="text" 
                placeholder={`Message #${channel === "ANNOUNCEMENTS" ? "announcements" : channel === "FORMAL" ? "formal-chat" : "informal-chat"}`} 
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
