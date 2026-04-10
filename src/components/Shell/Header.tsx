"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Bell, 
  Command, 
  ChevronDown, 
  LogOut, 
  User, 
  ShieldCheck, 
  Package, 
  ArrowUpRight,
  Sparkles,
  Calendar,
  X
} from "lucide-react";
import styles from "./Header.module.css";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NOTIFICATIONS = [
  { id: 1, text: "Charlie Dev approved your Innovation Lab booking", time: "2m ago", type: "success", icon: ShieldCheck },
  { id: 2, text: "New poll: 'Next Workshop Theme' is live", time: "15m ago", type: "info", icon: Sparkles },
  { id: 3, text: "Dr. Alice promoted you to CORE member", time: "1h ago", type: "primary", icon: User },
  { id: 4, text: "Robotics Club meeting moved to 4 PM", time: "3h ago", type: "warning", icon: Calendar }
];

const SEARCH_RESULTS = [
  { category: "PAGES", items: [
    { name: "Resources", href: "/resources", desc: "Book labs, tools, and spaces" },
    { name: "Live Feed", href: "/feed", desc: "Real-time activity and audit logs" },
    { name: "Members Hub", href: "/members", desc: "Connect with club collaborators" }
  ]},
  { category: "ACTIONS", items: [
    { name: "Request Booking", href: "/resources", desc: "Check availability and reserve" },
    { name: "Create Poll", href: "/polls", desc: "Start a new decision thread" },
    { name: "Broadcast Message", href: "/chat", desc: "Formal announcement channel" }
  ]}
];

export default function Header() {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Cmd + K Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.key === "Escape") {
        setShowNotifs(false);
        setShowPalette(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (href: string) => {
    setShowPalette(false);
    router.push(href);
  };



  return (
    <>
      <header className={clsx(styles.header, "glass")}>
        <div className={styles.searchBar} onClick={() => setShowPalette(true)}>
          <Search size={18} className={styles.searchIcon} />
          <div className={styles.searchInput}>Search anything...</div>
          <div className={styles.searchShortcut}>
            <Command size={12} /> K
          </div>
        </div>

        <div className={styles.actions}>
          <div style={{ position: "relative" }}>
            <button className={styles.actionBtn} onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={20} />
              <span className={styles.badge} />
            </button>

            {showNotifs && (
              <div className={clsx(styles.popover, "glass")}>
                <div className={styles.popoverHeader}>
                  <h3>Notifications</h3>
                  <button className={styles.clearBtn} onClick={() => setShowNotifs(false)}>Clear all</button>
                </div>
                <div className={styles.notificationList}>
                  {NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className={styles.notificationItem}>
                      <div className={styles.notifIcon} style={{ background: `var(--${notif.type})15`, color: `var(--${notif.type})` }}>
                        <notif.icon size={16} />
                      </div>
                      <div className={styles.notifContent}>
                        <p>{notif.text}</p>
                        <span className={styles.notifTime}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            className={clsx(styles.actionBtn, "glass-hover")} 
            onClick={() => { logout(); router.push("/"); }}
            title="Logout"
            style={{ marginLeft: "1rem" }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Command Palette Overlay */}
      {showPalette && (
        <>
          <div className={styles.paletteOverlay} onClick={() => setShowPalette(false)} />
          <div className={clsx(styles.commandPalette, "glass")}>
            <div className={styles.paletteSearch}>
              <Search size={24} className={styles.searchIcon} />
              <input 
                autoFocus
                type="text" 
                placeholder="What are you looking for?" 
                className={styles.paletteInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => setShowPalette(false)}><X size={20} /></button>
            </div>
            <div className={styles.paletteResults}>
              {SEARCH_RESULTS.map((section) => (
                <div key={section.category}>
                  <div className={styles.resultSection}>{section.category}</div>
                  {section.items.map((item) => (
                    <div 
                      key={item.name} 
                      className={styles.resultItem}
                      onClick={() => handleNavigate(item.href)}
                    >
                      <div className={styles.resultText}>
                        <span className={styles.resultName}>{item.name} <ArrowUpRight size={12} style={{ display: "inline", opacity: 0.5 }} /></span>
                        <span className={styles.resultDesc}>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
