"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
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
  FileText,
  Sparkles,
  Loader2,
  BrainCircuit,
  CalendarDays
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
  const [channel, setChannel] = useState<"INFORMAL" | "FORMAL">("INFORMAL");
  const [inputText, setInputText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryHours, setSummaryHours] = useState(24);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Real-time Cloud Hook (Supabase primary)
  const { messages: cloudMessages, sendMessage: sendToCloud, isConnecting, setMessages } = useChat(channel, activeClubId || undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [cloudMessages.length]);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const isTopRole = activeClub?.role === "SAC_HEAD" || activeClub?.role === "SAC_MEMBER" || activeClub?.role === "CLUB_HEAD";

  useEffect(() => {
    if (!isTopRole && channel === "FORMAL") {
      setChannel("INFORMAL");
    }
  }, [isTopRole, channel]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeClubId || !user) return;
    
    const content = inputText.trim();
    setInputText("");

    // 1. Optimistic UI update (Instant local feedback)
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender_name: user.name,
      content: content,
      channel: channel
    };
    
    // We update the hook's state directly for instant feedback
    setMessages(prev => [...prev, optimisticMessage]);

    // 2. Background Cloud Broadcast
    try {
      await sendToCloud(user.id, user.name, content, channel);
    } catch (e) {
      console.error("Cloud broadcast failed, message will persist only locally for now.");
    }
  };

  const handleSummarize = async () => {
    if (!activeClubId) return;
    setIsSummarizing(true);
    setSummary(null);
    setShowSummaryModal(true);

    try {
      const res = await fetch("/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          channel: channel,
          hours: summaryHours
        })
      });
      const data = await res.json();
      setSummary(data.summary || "No summary could be generated.");
    } catch (error) {
      setSummary("Error connecting to AI service.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Send file name as message via Supabase
    sendMessage(user.id, user.name, `📎 Shared file: ${file.name}`);
    setInputText("");
    
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
            className={clsx(styles.channelBtn, channel === "INFORMAL" && styles.activeChannel)}
            onClick={() => setChannel("INFORMAL")}
          >
            <MessageCircle size={18} />
            <div className={styles.channelInfo}>
              <span className={styles.channelName}>#informal-chat</span>
              <span className={styles.channelStatus}>Public discussion</span>
            </div>
          </button>
          
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
            <h4>{channel === "INFORMAL" ? "#informal-chat" : "#formal-chat"}</h4>
            <div className={styles.separator} />
            <span>{channel === "INFORMAL" ? "Casual brainstorming and discussion" : "Leadership group chat"}</span>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.summarizeBtn} 
              onClick={handleSummarize}
              title="AI Summary"
            >
              <Sparkles size={18} />
              <span>AI Briefing</span>
            </button>
            <Search size={18} />
            <MoreVertical size={18} />
          </div>
        </header>

        <div className={styles.messageList}>
          {cloudMessages.filter(m => m.channel === channel).map((msg) => (
            <div key={msg.id} className={clsx(styles.messageItem, msg.channel === "FORMAL" && styles.officialMessage)}>
              <div className={styles.messageAvatar}>{msg.sender_name.charAt(0)}</div>
              <div className={styles.messageContent}>
                <div className={styles.messageMeta}>
                  <span className={styles.messageSender}>{msg.sender_name}</span>
                  <span className={styles.messageTime}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.channel === "FORMAL" && <span className={styles.officialBadge}>FORMAL</span>}
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
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
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
              placeholder={`Message #${channel === "FORMAL" ? "formal-chat" : "informal-chat"}`} 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className={styles.emojiBtn}><Smile size={20} /></button>
            <button className={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
          </div>
        </div>
      </section>

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSummaryModal(false)}>
          <div className={clsx(styles.summaryModal, "glass")} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <BrainCircuit className={styles.sparkleIcon} />
                <h3>Formal Chat Intelligence</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowSummaryModal(false)}>
                <Plus style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.rangeSelector}>
                <label><CalendarDays size={14} /> Summary Range:</label>
                <select 
                  value={summaryHours} 
                  onChange={(e) => setSummaryHours(Number(e.target.value))}
                  disabled={isSummarizing}
                >
                  <option value={24}>Last 24 Hours</option>
                  <option value={168}>Last 7 Days</option>
                  <option value={720}>Last 30 Days</option>
                </select>
                <button 
                  className={styles.refreshBtn} 
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                >
                  {isSummarizing ? <Loader2 className={styles.spin} size={14} /> : "Update"}
                </button>
              </div>

              <div className={styles.summaryContent}>
                {isSummarizing ? (
                  <div className={styles.loadingState}>
                    <Loader2 className={styles.spin} size={32} />
                    <p>Grok is analyzing your formal discussions...</p>
                  </div>
                ) : (
                  <div className={styles.aiText}>
                    {summary?.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <p>Analysis powered by xAI Grok-Beta</p>
              <button className={styles.doneBtn} onClick={() => setShowSummaryModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
