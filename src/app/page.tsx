"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Users, Crown, ArrowRight } from "lucide-react";
import styles from "./Home.module.css";
import { clsx } from "clsx";

const PROXY_ROLES = [
  {
    title: "Faculty Coordinator",
    email: "faculty@uni.edu",
    description: "Administrative oversight and policy guidance for all student organizations.",
    icon: ShieldCheck,
    color: "#3b82f6"
  },
  {
    title: "Club Head",
    email: "coding.head@uni.edu",
    description: "Lead your team, manage resources, and broadcast official announcements.",
    icon: Crown,
    color: "#8b5cf6"
  },
  {
    title: "General Student",
    email: "student@uni.edu",
    description: "Participate in discussions, book resources, and join community events.",
    icon: Users,
    color: "#10b981"
  }
];

export default function Home() {
  const { user, loginAs, isLoading } = useAuth();
  const router = useRouter();

  // If already logged in, we can auto-redirect, or let them pick again
  // For the demo, we stay here until they select or if they were already here
  
  const handleSelectRole = async (email: string) => {
    await loginAs(email);
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="glass" style={{ padding: "2rem", borderRadius: "20px" }}>
          Initializing Ecosystem...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.tagline}>The College OS</span>
        <h1>Welcome to Modular Commons</h1>
        <p>A unified digital ecosystem for campus hierarchy, collaboration, and resource transparency.</p>
      </header>

      <div className={styles.grid}>
        {PROXY_ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <div 
              key={role.email} 
              className={clsx(styles.card, "glass")}
              onClick={() => handleSelectRole(role.email)}
            >
              <div 
                className={styles.iconWrapper} 
                style={{ backgroundColor: `${role.color}15`, color: role.color }}
              >
                <Icon size={32} />
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <div className={styles.cardFooter}>
                Enter Dashboard <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
