"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";
import styles from "./Home.module.css";

export default function Home() {
  const { isLoading } = useAuth();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.greenCloud}></div>
      <header className={styles.hero}>
        <span className={styles.tagline}>The College OS</span>
        <h1>Welcome to Modular Commons</h1>
        <p>A unified digital ecosystem for campus hierarchy, collaboration, and resource transparency.</p>
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            className="glass" 
            style={{ padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1.25rem', color: 'var(--primary)', cursor: 'pointer', border: '1px solid var(--primary)', background: 'transparent' }} 
            onClick={() => router.push('/login')}
          >
            Access Role Login Simulator <ArrowRight size={20} style={{ display: 'inline', marginLeft: '8px' }} />
          </button>
        </div>
      </header>
    </div>
  );
}
