"use client";

import React, { useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, Mail, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck, Info } from "lucide-react";
import styles from "./Login.module.css";
import { clsx } from "clsx";

export default function LoginPage() {
  const { loginAsRole } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");

  React.useEffect(() => {
    const savedName = localStorage.getItem("modular_display_name");
    if (savedName) setDisplayName(savedName);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelper, setShowHelper] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Differentiate yourself. Enter a Display Name.");
      return;
    }
    setIsLoading(true);
    setError("");

    // Strategic Mock Logic
    const credentials: Record<string, { pass: string; role: Role }> = {
      "sac.head@iiitkota.ac.in": { pass: "head123", role: "SAC_HEAD" },
      "sac.member@iiitkota.ac.in": { pass: "sac123", role: "SAC_MEMBER" },
      "club.head@iiitkota.ac.in": { pass: "club123", role: "CLUB_HEAD" },
      "core.member@iiitkota.ac.in": { pass: "core123", role: "CORE_MEMBER" },
      "student@iiitkota.ac.in": { pass: "student123", role: "STUDENT" },
    };

    const target = credentials[email.toLowerCase()];

    if (target && target.pass === password) {
      await loginAsRole(target.role, displayName);
      router.push(`/dashboard/${target.role.toLowerCase().replace("_", "-")}`);
    } else {
      setError("Invalid credential sequence. Access denied.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      
      <div className={clsx(styles.loginCard, "glass")}>
        <div className={styles.header}>
          <div className={styles.logoCircle}>
            <ShieldCheck size={32} />
          </div>
          <h1>Terminal Access</h1>
          <p>Initialize your secure session</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label>Your Name (Identity)</label>
            <div className={styles.inputWrapper}>
              <UserIcon size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="e.g. Gaurav" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>E-Mail Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="identity@iiitkota.ac.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Access Key</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className={styles.toggleVisibility}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Validating..." : (
              <>
                Confirm Access <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <button className={styles.helperToggle} onClick={() => setShowHelper(!showHelper)}>
          <Info size={16} /> View Demo Credentials
        </button>

        {showHelper && (
          <div className={styles.helperOverlay}>
            <div className={clsx(styles.helperContent, "glass")}>
              <h3>Role Access Codes</h3>
              <ul>
                <li><strong>SAC Head:</strong> sac.head@iiitkota.ac.in | head123</li>
                <li><strong>Club Head:</strong> club.head@iiitkota.ac.in | club123</li>
                <li><strong>Core Member:</strong> core.member@iiitkota.ac.in | core123</li>
                <li><strong>SAC Member:</strong> sac.member@iiitkota.ac.in | sac123</li>
                <li><strong>Student:</strong> student@iiitkota.ac.in | student123</li>
              </ul>
              <button onClick={() => setShowHelper(false)}>Close</button>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p>IIIT Kota Central Authentication System • v2.0</p>
        </div>
      </div>
    </div>
  );
}
