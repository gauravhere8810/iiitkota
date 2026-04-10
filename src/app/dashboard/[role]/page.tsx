"use client";

import React from "react";
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
  Settings 
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
  
  // Map slug back to enum
  const roleEnum = roleSlug.toUpperCase().replace("-", "_") as Role;
  
  if (!ROLE_HIERARCHY[roleEnum]) {
    return notFound();
  }

  // Simulate unauthorized if the logged-in user doesn't match the role or hierarchy
  // For this demo, we'll allow viewing if current role matches
  if (!user || user.role !== roleEnum) {
    return (
      <div className={styles.locked}>
        <Lock size={48} />
        <h1>Access Restricted balance</h1>
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
             {ROLE_HIERARCHY[roleEnum] >= 4 && (
               <div className={styles.controlItem}>
                 <h4>Administrative Oversight</h4>
                 <p>Global budget allocation and constitutional modifications.</p>
                 <button className={styles.actionBtn}>Open Panel</button>
               </div>
             )}
             {ROLE_HIERARCHY[roleEnum] >= 3 && (
               <div className={styles.controlItem}>
                 <h4>Leadership Tools</h4>
                 <p>Resource approval and core member evaluation.</p>
                 <button className={styles.actionBtn}>Manage Team</button>
               </div>
             )}
             <div className={styles.controlItem}>
               <h4>General Access</h4>
               <p>Access your personal profile and registered interest groups.</p>
               <button className={styles.actionBtn}>View Profile</button>
             </div>
          </div>
        </div>
        {roleEnum === "CLUB_HEAD" && <ClubHeadEventsFeed />}
      </div>
    </div>
  );
}

function ClubHeadEventsFeed() {
  const [events, setEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(10);
        if (data) setEvents(data);
      } catch (e) {}
    };
    fetchEvents();

    const channel = supabase
      .channel("events-feed-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload: any) => {
          setEvents((curr) => [payload.new, ...curr]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className={clsx(styles.card, "glass")} style={{ gridColumn: "1 / -1", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
      <div className={styles.cardHeader} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
        <Activity size={20} color="#3b82f6" />
        <h3 style={{ color: "#3b82f6" }}>Live Member Event Submissions</h3>
      </div>
      <div className={styles.content}>
        {events.length === 0 ? (
          <p className={styles.empty}>Waiting for core members to submit new events...</p>
        ) : (
          <ul className={styles.taskList} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {events.map((ev, i) => (
              <li key={ev.id || i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "0.25rem" }}>
                  <strong style={{ fontSize: "1.1rem", color: "white" }}>{ev.title || "Untitled Event"}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#10b981", background: "rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: "100px" }}>NEW</span>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{ev.description || "No description provided."}</p>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><User size={12} /> {ev.created_by_name || "Club Member"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
