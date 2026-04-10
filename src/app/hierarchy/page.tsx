"use client";

import React from "react";
import { 
  ShieldCheck, 
  Users, 
  Crown, 
  UserCircle, 
  FileText,
  Lock,
  ArrowDown
} from "lucide-react";
import styles from "./Hierarchy.module.css";
import { clsx } from "clsx";

const HIERARCHY = [
  {
    level: "ORGANIZATION",
    roles: [
      { name: "Head", icon: Crown, color: "#f59e0b", desc: "Top-level authority overseeing all campus operations and strategic decisions." },
      { name: "Faculty Coordinator", icon: ShieldCheck, color: "#3b82f6", desc: "Administrative oversight and policy guidance for all student organizations." }
    ]
  },
  {
    level: "CLUB",
    roles: [
      { name: "Club Head", icon: Crown, color: "#8b5cf6", desc: "Primary leader of a specific club, responsible for team and resource management." },
      { name: "Club Coordinator", icon: UserCircle, color: "#ec4899", desc: "Handles formal communications, event planning, and operations." }
    ]
  },
  {
    level: "OPERATIONAL",
    roles: [
      { name: "Core Member", icon: Users, color: "#10b981", desc: "Active contributors involved in the specialized decision-making process." },
      { name: "General Member", icon: Users, color: "#94a3b8", desc: "Community participants with access to resources and event registration." }
    ]
  }
];

export default function HierarchyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Power Hierarchy</h1>
        <p>Transparent authority structure and permission gating for Modular University.</p>
      </header>

      <div className={styles.tree}>
        {HIERARCHY.map((tier, tierIdx) => (
          <React.Fragment key={tier.level}>
            <div className={styles.tier}>
              <div className={styles.tierLabel}>{tier.level} LEVEL</div>
              <div className={styles.rolesGrid}>
                {tier.roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div key={role.name} className={clsx(styles.roleCard, "glass")}>
                      <div className={styles.roleHeader}>
                        <div className={styles.iconBox} style={{ backgroundColor: `${role.color}15`, color: role.color }}>
                          <Icon size={24} />
                        </div>
                        <div className={styles.roleTitle}>
                          <h3>{role.name}</h3>
                          <span className={styles.badge}>RANK {tierIdx + 1}</span>
                        </div>
                      </div>
                      <p className={styles.roleDesc}>{role.desc}</p>
                      
                      <div className={styles.permissions}>
                        <div className={styles.permItem}>
                          <Lock size={12} /> <span>Full Resource Control</span>
                        </div>
                        <div className={styles.permItem}>
                          <FileText size={12} /> <span>Audit Review Access</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {tierIdx < HIERARCHY.length - 1 && (
              <div className={styles.connector}>
                <ArrowDown size={32} strokeWidth={1} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className={clsx(styles.auditCallout, "glass")}>
        <div className={styles.calloutIcon}><ShieldCheck size={32} /></div>
        <div className={styles.calloutText}>
          <h4>Auditable Transitions</h4>
          <p>Every role promotion, demotion, or assignment is logged in the permanent audit timeline. Role-based actions are cryptographically gated in the backend ecosystem.</p>
        </div>
        <button className={styles.auditBtn}>View Audit Logs</button>
      </div>
    </div>
  );
}
