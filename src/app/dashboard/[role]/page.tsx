"use client";

import React, { useState, useEffect } from "react";
import { useAuth, Role, ROLE_HIERARCHY } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";
import { 
  Trophy, 
  Shield, 
  Star, 
  Users, 
  User, 
  Lock, 
  ChevronRight, 
  Activity, 
  FileText, 
  Settings,
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  Megaphone,
  Clock,
  Check,
  X
} from "lucide-react";
import styles from "./RoleDashboard.module.css";
import { clsx } from "clsx";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default function RoleDashboard({ params }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const roleSlug = resolvedParams.role;
  
  // Real-time Event Proposal State
  const [showProposeModal, setShowProposeModal] = React.useState(false);
  const [eventTitle, setEventTitle] = React.useState("");
  const [eventDesc, setEventDesc] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Map slug back to enum
  const roleEnum = roleSlug.toUpperCase().replace("-", "_") as Role;

  useEffect(() => {
    // Redirect if no user (safety)
    if (!user) return;
  }, [user]);

  if (!ROLE_HIERARCHY[roleEnum]) {
    return notFound();
  }

  // Simulate unauthorized if the logged-in user doesn't match the role or hierarchy
  if (!user || user.role !== roleEnum) {
    return (
      <div className={styles.locked}>
        <Lock size={48} />
        <h1>Access Restricted</h1>
        <p>You need to be logged in as a <strong>{roleEnum.replace("_", " ")}</strong> to view this portal.</p>
        <button onClick={() => router.push("/login")}>Go to Login</button>
      </div>
    );
  }

  const roleConfig = {
    SAC_HEAD: { icon: Trophy, color: "#f59e0b", label: "Financials, Strategic Policy, SAC Core" },
    SAC_MEMBER: { icon: Shield, color: "#8b5cf6", label: "Inter-club Coordination, Budget Review" },
    CLUB_HEAD: { icon: Star, color: "#3b82f6", label: "Event Management, Resource Booking" },
    CORE_MEMBER: { icon: Users, color: "#10b981", label: "Internal Club Operations, Attendance" },
    STUDENT: { icon: User, color: "#6b7280", label: "Event Feed, Resource Request" },
  }[roleEnum];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.roleBadge} style={{ backgroundColor: `${roleConfig.color}20`, color: roleConfig.color }}>
          <roleConfig.icon size={16} />
          <span>{roleEnum.replace("_", " ")}</span>
        </div>
        <h1>{roleEnum.replace("_", " ")} Workspace</h1>
        <p>Manage {roleConfig.label}</p>
      </header>

      <div className={styles.grid}>
        <div className={clsx(styles.card, "glass")}>
          <div className={styles.cardHeader}>
            <Activity size={20} />
            <h3>Recent Actions</h3>
          </div>
          <div className={styles.content}>
            <p className={styles.empty}>No recent activity in your workspace.</p>
          </div>
        </div>

        <div className={clsx(styles.card, "glass")}>
          <div className={styles.cardHeader}>
            <FileText size={20} />
            <h3>Assigned Tasks</h3>
          </div>
          <div className={styles.content}>
            <ul className={styles.taskList}>
              <li>
                <ChevronRight size={14} />
                <span>Verify quarterly budget reports</span>
              </li>
              <li>
                <ChevronRight size={14} />
                <span>Approve upcoming tech-fest events</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={clsx(styles.card, "glass", styles.span2)}>
          <div className={styles.cardHeader}>
            <Settings size={20} />
            <h3>Role-Based Controls</h3>
          </div>
          <div className={styles.controls}>
             {ROLE_HIERARCHY[roleEnum] >= 2 && (
               <div className={styles.controlItem}>
                 <h4>Event Operations</h4>
                 <p>Propose new community initiatives and club gatherings.</p>
                 <button 
                  className={styles.actionBtn} 
                  style={{ background: "var(--primary)", color: "white" }}
                  onClick={() => setShowProposeModal(true)}
                 >
                   <Plus size={14} /> Propose Event
                 </button>
               </div>
             )}
             <div className={styles.controlItem}>
               <h4>General Access</h4>
               <p>Access your personal profile and registered interest groups.</p>
               <button className={styles.actionBtn}>View Profile</button>
             </div>
          </div>
        </div>

        {/* Propose Event Modal */}
        {showProposeModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setShowProposeModal(false)}>
            <div className="glass" style={{ width: "100%", maxWidth: "500px", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", position: "relative" }} onClick={e => e.stopPropagation()}>
              {showSuccess ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 1rem" }} />
                  <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "0.5rem" }}>Proposal Sent!</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)" }}>The Club Head will see your request in real-time.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>Propose New Event</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>Event Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hackathon Kickoff" 
                        value={eventTitle}
                        onChange={e => setEventTitle(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.75rem", color: "white", outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>Description</label>
                      <textarea 
                        rows={3}
                        placeholder="Detailed plan for the event..." 
                        value={eventDesc}
                        onChange={e => setEventDesc(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.75rem", color: "white", outline: "none", resize: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                      <button 
                        onClick={() => setShowProposeModal(false)}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!eventTitle || isSubmitting}
                        onClick={async () => {
                          setIsSubmitting(true);
                          try {
                            const { error } = await supabase.from("events").insert([
                              {
                                title: eventTitle,
                                description: eventDesc,
                                created_by_name: user?.name,
                                venue: "Cloud Room",
                                startTime: new Date().toISOString(),
                                endTime: new Date().toISOString(),
                                clubId: "collaboration-hub",
                                status: "PENDING"
                              }
                            ]);
                            if (!error) {
                              setShowSuccess(true);
                              setTimeout(() => {
                                setShowProposeModal(false);
                                setShowSuccess(false);
                                setEventTitle("");
                                setEventDesc("");
                              }, 2000);
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        style={{ flex: 2, padding: "0.75rem", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}
                      >
                        {isSubmitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                        Submit Proposal
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {roleEnum === "CLUB_HEAD" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", gridColumn: "1 / -1" }}>
            <ClubHeadEventsFeed />
          </div>
        ) : (
          <UserEventProposals currentUserName={user?.name} />
        )}
      </div>
    </div>
  );
}

function UserEventProposals({ currentUserName }: { currentUserName?: string }) {
  const [proposals, setProposals] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchProposals = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("created_by_name", currentUserName)
        .order("created_at", { ascending: false });
      if (data) setProposals(data);
    };
    fetchProposals();

    const channel = supabase
      .channel("user-proposals-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload: any) => {
          if (payload.new.created_by_name === currentUserName) {
            if (payload.eventType === "INSERT") {
              setProposals((curr) => [payload.new, ...curr]);
            } else if (payload.eventType === "UPDATE") {
              setProposals((curr) => curr.map(p => p.id === payload.new.id ? payload.new : p));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserName]);

  if (proposals.length === 0) return null;

  return (
    <div className={clsx(styles.card, "glass")} style={{ gridColumn: "1 / -1" }}>
      <div className={styles.cardHeader}>
        <Clock size={20} />
        <h3>My Event Proposals</h3>
      </div>
      <div className={styles.content}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {proposals.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <strong style={{ display: "block", color: "white" }}>{p.title}</strong>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ 
                padding: "4px 12px", 
                borderRadius: "100px", 
                fontSize: "0.75rem", 
                fontWeight: "600",
                background: p.status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : p.status === "REJECTED" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: p.status === "APPROVED" ? "#10b981" : p.status === "REJECTED" ? "#ef4444" : "#f59e0b"
              }}>
                {p.status || "PENDING"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClubHeadEventsFeed() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
        if (data) {
          console.log("DEBUG: Keys in first event object:", Object.keys(data[0] || {}));
          setEvents(data);
        }
      } catch (e) {}
    };
    fetchEvents();

    const channel = supabase
      .channel("events-feed-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setEvents((curr) => [payload.new, ...curr]);
          } else if (payload.eventType === "UPDATE") {
            setEvents((curr) => curr.map(ev => ev.id === payload.new.id ? payload.new : ev));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsProcessing(id);
    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message || "Update failed");
      }
      
      console.log("Update successful via Supabase!");
    } catch (err: any) {
      console.error("Critical Update Failure:", err.message || err);
    } finally {
      setIsProcessing(null);
    }
  };

  const pending = events.filter(e => !e.status || e.status === "PENDING");
  const history = events.filter(e => e.status === "APPROVED" || e.status === "REJECTED");

  return (
    <>
      <div className={clsx(styles.card, "glass")} style={{ border: "1px solid rgba(59, 130, 246, 0.3)" }}>
        <div className={styles.cardHeader} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
          <Activity size={20} color="#3b82f6" />
          <h3 style={{ color: "#3b82f6" }}>Pending Event Proposals</h3>
        </div>
        <div className={styles.content}>
          {pending.length === 0 ? (
            <p className={styles.empty}>No pending proposals at the moment.</p>
          ) : (
            <ul className={styles.taskList} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {pending.map((ev) => (
                <li key={ev.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "0.25rem" }}>
                    <strong style={{ fontSize: "1.1rem", color: "white" }}>{ev.title}</strong>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button 
                         disabled={!!isProcessing}
                         onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                         style={{ background: "rgba(16,185,129,0.2)", border: "none", borderRadius: "4px", color: "#10b981", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
                       >
                         {isProcessing === ev.id ? <Loader2 size={12} className="spin" /> : <Check size={12} />} Accept
                       </button>
                       <button 
                         disabled={!!isProcessing}
                         onClick={() => handleStatusUpdate(ev.id, "REJECTED")}
                         style={{ background: "rgba(239,68,68,0.2)", border: "none", borderRadius: "4px", color: "#ef4444", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
                       >
                         {isProcessing === ev.id ? <Loader2 size={12} className="spin" /> : <X size={12} />} Reject
                       </button>
                    </div>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{ev.description}</p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><User size={12} /> {ev.created_by_name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {new Date(ev.created_at).toLocaleTimeString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={clsx(styles.card, "glass")}>
        <div className={styles.cardHeader}>
          <Clock size={20} />
          <h3>Proposal History</h3>
        </div>
        <div className={styles.content}>
          {history.length === 0 ? (
            <p className={styles.empty}>No history yet.</p>
          ) : (
            <ul className={styles.taskList} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              {history.map((ev) => (
                <li key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ color: "white", fontSize: "0.9rem" }}>{ev.title}</span>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>By {ev.created_by_name} • {new Date(ev.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ 
                    fontSize: "0.7rem", 
                    fontWeight: "600",
                    color: ev.status === "APPROVED" ? "#10b981" : "#ef4444"
                  }}>
                    {ev.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
