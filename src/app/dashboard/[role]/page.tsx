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
      </div>
    </div>
  );
}
