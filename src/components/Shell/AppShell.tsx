"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./AppShell.module.css";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 className={styles.spinner} size={48} />
        <span className={styles.loadingText}>Initializing Modular Commons...</span>
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
    </div>
  );
}
