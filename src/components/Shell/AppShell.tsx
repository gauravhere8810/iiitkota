"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./AppShell.module.css";
import { useAuth } from "@/context/AuthContext";
import { Loader2, BellRing, CheckCircle2, XCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AlertPopup {
  type: "NEW_REQUEST";
  id: string;
  requesterId: string;
  requesterName: string;
  resourceName: string;
  reason: string;
  clubId: string;
}

interface InfoPopup {
  id: string;
  resourceName: string;
  newStatus: "APPROVED" | "REJECTED";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, activeClubId, isLoading } = useAuth();
  const [overrideWait, setOverrideWait] = useState(false);
  const [popups, setPopups] = useState<AlertPopup[]>([]);
  const [infoPopups, setInfoPopups] = useState<InfoPopup[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const isTopRole = activeClub?.role === "SAC_HEAD" || activeClub?.role === "CLUB_HEAD";

  useEffect(() => {
    // Supersonic Bypass: Force UI to load within 1s even if Auth is slow
    const forceLoad = setTimeout(() => setOverrideWait(true), 1000);
    return () => clearTimeout(forceLoad);
  }, []);

  // Listen for real-time resource requests globally using chat_messages as a bus
  useEffect(() => {
    const sub = supabase.channel('resource-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.channel === 'RESOURCE_ALERTS') {
            try {
              const data = JSON.parse(newMsg.content);
              
              if (data.type === 'NEW_REQUEST' && isTopRole) {
                if (data.clubId === activeClubId || !activeClubId) {
                  setPopups(prev => {
                    if (prev.some(p => p.id === data.id)) return prev;
                    return [...prev, data as AlertPopup];
                  });
                }
              } else if (data.type === 'STATUS_UPDATE') {
                // Remove the action popup from all top roles since someone approved it
                setPopups(prev => prev.filter(p => p.id !== data.id));
                
                // If we are the requester, show the feedback popup!
                if (user?.id === data.requesterId) {
                  setInfoPopups(prev => [...prev, {
                    id: Date.now().toString() + Math.random(),
                    resourceName: data.resourceName,
                    newStatus: data.newStatus
                  }]);
                }
              }
            } catch (err) {
              console.error("Failed to parse alert", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [isTopRole, activeClubId]);

  const handleQuickApprove = async (id: string, action: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/resources/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action })
      });
      if (res.ok) {
        const targetPopup = popups.find(p => p.id === id);
        setPopups(prev => prev.filter(p => p.id !== id));
        
        // Notify all devices to refresh UI and ping the requester
        await supabase.from("chat_messages").insert([{
          sender_id: user?.id || "SYSTEM",
          sender_name: "SYSTEM",
          channel: "RESOURCE_ALERTS",
          content: JSON.stringify({ 
            type: "STATUS_UPDATE",
            id: id,
            requesterId: targetPopup?.requesterId,
            resourceName: targetPopup?.resourceName,
            newStatus: action 
          })
        }]);
      }
    } catch (err) {
      console.error("Popup approval failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading && !overrideWait) {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 className={styles.spinner} size={48} />
        <span className={styles.loadingText}>Initializing Modular Framework...</span>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.rightContent}>
        <Header />
        <main className={styles.main}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>

      {/* Global Real-Time Event Popups */}
      <div className={styles.popupContainer}>
        {popups.map(popup => (
          <div key={popup.id} className={styles.popup}>
            <button 
              className={styles.closePopup} 
              onClick={() => setPopups(prev => prev.filter(p => p.id !== popup.id))}
            >
              <X size={16} />
            </button>
            <div className={styles.popupHeader}>
              <BellRing size={16} />
              Resource Request
            </div>
            <div className={styles.popupBody}>
              <strong>{popup.requesterName}</strong> requested <strong>{popup.resourceName}</strong>
              <br /><br />
              <em>"{popup.reason}"</em>
            </div>
            <div className={styles.popupActions}>
              <button 
                className={styles.approveBtn}
                onClick={() => handleQuickApprove(popup.id, "APPROVED")}
                disabled={processingId === popup.id}
              >
                {processingId === popup.id ? <Loader2 size={14} className={styles.spin} /> : <CheckCircle2 size={14} />}
                Approve
              </button>
              <button 
                className={styles.rejectBtn}
                onClick={() => handleQuickApprove(popup.id, "REJECTED")}
                disabled={processingId === popup.id}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        ))}

        {infoPopups.map(info => (
          <div key={info.id} className={styles.popup}>
            <button 
              className={styles.closePopup} 
              onClick={() => setInfoPopups(prev => prev.filter(p => p.id !== info.id))}
            >
              <X size={16} />
            </button>
            <div className={styles.popupHeader}>
              {info.newStatus === "APPROVED" ? (
                <CheckCircle2 size={16} color="#22c55e" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
              Request {info.newStatus === "APPROVED" ? "Approved" : "Rejected"}
            </div>
            <div className={styles.popupBody}>
              Your request for <strong>{info.resourceName}</strong> was {info.newStatus.toLowerCase()}.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
