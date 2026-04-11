"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Users, Crown, ArrowRight, Loader2 } from "lucide-react";
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
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [overrideWait, setOverrideWait] = React.useState(false);

  React.useEffect(() => {
    // Maximum wait time of 1.5s for auth context to initialize
    const forceLoad = setTimeout(() => {
      setOverrideWait(true);
    }, 1500);
    return () => clearTimeout(forceLoad);
  }, []);

  // Render immediately; auth data will fill in when ready.
  return (
    <div className={styles.container}>
      <div className={styles.greenCloud}></div>
      <header className={styles.hero}>
        <span className={styles.tagline}>The College OS</span>
        <h1>Welcome to Modular Commons</h1>
        <p>A unified digital ecosystem for campus hierarchy, collaboration, and resource transparency.</p>
        
        {isLoading && !overrideWait ? (
           <div className="glass" style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '300px', margin: '2rem auto 0' }}>
             <Loader2 className="spin" size={16} />
             <span style={{ fontSize: '0.9rem' }}>Initializing identity...</span>
           </div>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            <button 
              className="glass" 
              style={{ padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1.25rem', color: 'var(--primary)', cursor: 'pointer', border: '1px solid var(--primary)', background: 'transparent' }} 
              onClick={() => router.push('/login')}
            >
              Access Role Login Simulator <ArrowRight size={20} style={{ display: 'inline', marginLeft: '8px' }} />
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
