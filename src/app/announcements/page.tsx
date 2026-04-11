"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Send, 
  Megaphone, 
  Lock, 
  Plus,
  Search,
  FileText,
  MoreVertical,
  Smile
} from "lucide-react";
import styles from "../chat/Chat.module.css";
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

export default function AnnouncementsPage() {
  const { user, activeClubId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  // Authorization boundary: Top roles ONLY
  const isTopRole = activeClub?.role === "SAC_HEAD" || activeClub?.role === "SAC_MEMBER" || activeClub?.role === "CLUB_HEAD" || user?.role === "SAC_HEAD" || user?.role === "CLUB_HEAD" || user?.role === "SAC_MEMBER";

  useEffect(() => {
    // Isolated strict mocked timeline layout for announcements
    setMessages([
      { id: "101", sender: "Dr. Alice Smith", content: "OFFICIAL: The Coding Lab will be closed for maintenance tomorrow from 2 PM to 5 PM.", timestamp: "09:00 AM", isOfficial: true },
      { id: "102", sender: "Prof. Bob Jones", content: "REMINDER: Annual Membership fees are due by end of this week.", timestamp: "Yesterday", isOfficial: true },
    ]);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: user?.name || "Unknown",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfficial: true
    };
    setMessages([...messages, newMessage]);
    setInputText("");
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
      isOfficial: true,
      fileUrl,
      fileType: file.type,
      fileName: file.name
    };
    
    setMessages([...messages, newMessage]);
    setInputText("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <section className={clsx(styles.chatWindow, "glass")} style={{ width: "100%", margin: "0 auto", maxWidth: "1200px" }}>
        <header className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <Megaphone size={20} style={{ color: "var(--primary)", marginRight: "12px" }} />
            <h4>#announcements</h4>
            <div className={styles.separator} />
            <span>Official Hub Communications & Directives</span>
          </div>
          <div className={styles.headerActions}>
            <Search size={18} />
            <MoreVertical size={18} />
          </div>
        </header>

        <div className={styles.messageList} style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem", opacity: 0.5, fontSize: "0.85rem" }}>
            This is the start of the #announcements timeline.
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={clsx(styles.messageItem, styles.officialMessage)}>
              <div className={styles.messageAvatar}>{msg.sender.charAt(0)}</div>
              <div className={styles.messageContent}>
                <div className={styles.messageMeta}>
                  <span className={styles.messageSender}>{msg.sender}</span>
                  <span className={styles.messageTime}>{msg.timestamp}</span>
                  <span className={styles.officialBadge}>OFFICIAL</span>
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
          {isTopRole ? (
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
                placeholder="Broadcast a new official announcement to all members..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className={styles.emojiBtn}><Smile size={20} /></button>
              <button className={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
            </div>
          ) : (
            <div className={styles.readOnlyNotice} style={{ background: "rgba(255,0,0,0.05)", border: "1px solid rgba(255,0,0,0.1)", color: "rgba(255,255,255,0.7)" }}>
              <Lock size={14} /> You are exploring in read-only mode. Only coordinators and heads can broadcast announcements to this feed.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
