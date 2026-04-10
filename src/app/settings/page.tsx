"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Eye, 
  LogOut,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import styles from "./Settings.module.css";
import { clsx } from "clsx";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("ACCOUNT");

  const SETTINGS_SECTIONS = [
    { id: "ACCOUNT", name: "Account Details", icon: User },
    { id: "NOTIF", name: "Notifications", icon: Bell },
    { id: "SECURITY", name: "Security", icon: Lock },
    { id: "THEME", name: "Appearance", icon: Palette },
  ];

  if (!user) return <div>Please authorize first.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account preferences and ecosystem configuration.</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button 
                key={section.id} 
                className={clsx(styles.tabBtn, activeTab === section.id && styles.activeTab)}
                onClick={() => setActiveTab(section.id)}
              >
                <Icon size={18} />
                <span>{section.name}</span>
                <ChevronRight size={14} className={styles.chevron} />
              </button>
            );
          })}
          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={() => logout()}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className={clsx(styles.content, "glass")}>
          {activeTab === "ACCOUNT" && (
            <div className={styles.tabContent}>
              <h3>Personal Details</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input type="text" defaultValue={user.name} />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input type="email" defaultValue={user.email} disabled />
                  <span className={styles.hint}>Email cannot be changed in demo mode.</span>
                </div>
                <div className={styles.formGroup}>
                  <label>Primary Role</label>
                  <div className={styles.roleDisplay}>{user.role}</div>
                </div>
              </div>
              
              <div className={styles.divider} />
              
              <h3>Preferences</h3>
              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>
                  <p>Profile Visibility</p>
                  <span>Allow other members to see your bio and skills.</span>
                </div>
                <div className={styles.toggle} data-active="true" />
              </div>
            </div>
          )}

          {activeTab === "NOTIF" && (
            <div className={styles.tabContent}>
              <h3>Notification Preferences</h3>
              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleText}>
                    <p>Formal Announcements</p>
                    <span>Get notified of high-priority club updates.</span>
                  </div>
                  <div className={styles.toggle} data-active="true" />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleText}>
                    <p>Resource Approvals</p>
                    <span>Receive alerts when your booking is approved.</span>
                  </div>
                  <div className={styles.toggle} data-active="true" />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleText}>
                    <p>Social Activity</p>
                    <span>Notifications for mentions in informal chats.</span>
                  </div>
                  <div className={styles.toggle} data-active="false" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "SECURITY" && (
            <div className={styles.tabContent}>
              <div className={styles.securityAlert}>
                <ShieldAlert size={20} />
                <div className={styles.alertText}>
                  <p>Demo Security Active</p>
                  <span>Password changes are disabled during the live demo.</span>
                </div>
              </div>
              <h3>Security Settings</h3>
              <button className={styles.actionBtn}>Enable Two-Factor Authentication</button>
            </div>
          )}

          {activeTab === "THEME" && (
            <div className={styles.tabContent}>
              <h3>Appearance</h3>
              <p>System is locked to **Premium Dark Mode** for visual excellence.</p>
              <div className={styles.themeGrid}>
                <div className={clsx(styles.themeCard, styles.activeTheme)}>
                  <div className={styles.themePreview} />
                  <span>Glassmorphism Dark</span>
                </div>
                <div className={styles.themeCard} style={{ opacity: 0.5 }}>
                  <div className={styles.themePreview} style={{ background: "#f8fafc" }} />
                  <span>Minimal Light (Coming Soon)</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
