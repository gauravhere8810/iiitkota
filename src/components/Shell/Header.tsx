"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Bell, Command, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import styles from "./Header.module.css";
import { clsx } from "clsx";

const PROXY_USERS = [
  { name: "Global Head", email: "head@uni.edu" },
  { name: "Faculty Coordinator", email: "faculty@uni.edu" },
  { name: "Club Head (Coding)", email: "coding.head@uni.edu" },
  { name: "Core Member (Coding)", email: "coding.core@uni.edu" },
  { name: "General Student", email: "student@uni.edu" },
];

export default function Header() {
  const { user, loginAs, logout } = useAuth();
  const [showProxy, setShowProxy] = useState(false);

  return (
    <header className={clsx(styles.header, "glass")}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search anything... (Cmd + K)" className={styles.searchInput} />
        <div className={styles.searchShortcut}>
          <Command size={12} /> K
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn}>
          <Bell size={20} />
          <span className={styles.badge} />
        </button>

        <div className={styles.proxyWrapper}>
          <button 
            className={clsx(styles.proxyToggle, "glass-hover")}
            onClick={() => setShowProxy(!showProxy)}
          >
            <span className={styles.proxyLabel}>Proxy Login</span>
            <ChevronDown size={14} />
          </button>

          {showProxy && (
            <div className={clsx(styles.proxyMenu, "glass")}>
              <div className={styles.menuHeader}>Switch User Role</div>
              {PROXY_USERS.map((u) => (
                <button 
                  key={u.email} 
                  className={styles.menuItem}
                  onClick={() => {
                    loginAs(u.email);
                    setShowProxy(false);
                  }}
                >
                  <div className={styles.menuUser}>
                    <span className={styles.menuName}>{u.name}</span>
                    <span className={styles.menuEmail}>{u.email}</span>
                  </div>
                </button>
              ))}
              <div className={styles.menuDivider} />
              <button className={styles.menuItem} onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Typo fix for clsx in one line if needed inside the thought but I will fix it in the code.
