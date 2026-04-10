"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import styles from "./CommandCenterChat.module.css";
import { clsx } from "clsx";

export default function CommandCenterChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { messages, sendMessage, isConnecting } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setIsSending(true);
    await sendMessage(user.id, user.name, inputText.trim());
    setInputText("");
    setIsSending(false);
  };

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={clsx(styles.toggleBtn, "glass")}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: isMinimized ? 440 : 0, 
              scale: 1 
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className={clsx(styles.chatWindow, "glass")}
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <div className={styles.statusDot} />
                <span>Command Center HQ</span>
              </div>
              <div className={styles.headerActions}>
                <button onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {isConnecting ? (
                <div className={styles.loadingState}>Establishing secure connection...</div>
              ) : messages.length === 0 ? (
                <div className={styles.emptyState}>No messages yet. Start the coordination.</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={clsx(styles.messageRow, isMe && styles.messageRowMe)}>
                      {!isMe && <span className={styles.senderName}>{msg.sender_name}</span>}
                      <div className={clsx(styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem)}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Broadcast sequence..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
              />
              <button type="submit" disabled={!inputText.trim() || isSending} className={styles.sendBtn}>
                {isSending ? <div className={styles.spinner} /> : <Send size={18} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
