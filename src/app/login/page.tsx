"use client";

import React, { useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, User, Users, Star, Trophy, ArrowRight } from "lucide-react";
import styles from "./login.module.css";
import { clsx } from "clsx";

const ROLES: { name: string; value: Role; icon: any; color: string; desc: string }[] = [
  { 
    name: "SAC Head", 
    value: "SAC_HEAD", 
    icon: Trophy, 
    color: "#f59e0b", 
    desc: "Highest authority in Student Activity Council" 
  },
  { 
    name: "SAC Member", 
    value: "SAC_MEMBER", 
    icon: Shield, 
    color: "#8b5cf6", 
    desc: "Strategic decisions and council operations" 
  },
  { 
    name: "Club Head", 
    value: "CLUB_HEAD", 
    icon: Star, 
    color: "#3b82f6", 
    desc: "Leadership and direction for club activities" 
  },
  { 
    name: "Core Member", 
    value: "CORE_MEMBER", 
    icon: Users, 
    color: "#10b981", 
    desc: "Active participation in club management" 
  },
  { 
    name: "Student", 
    value: "STUDENT", 
    icon: User, 
    color: "#6b7280", 
    desc: "Accessing events and resources" 
  },
];

export default function LoginPage() {
  const { loginAsRole } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleLogin = async (role: Role) => {
    setSelectedRole(role);
    await loginAsRole(role);
    router.push(`/dashboard/${role.toLowerCase().replace("_", "-")}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      
      <div className={clsx(styles.loginCard, "glass")}>
        <div className={styles.header}>
          <h1>Portal Access</h1>
          <p>Select your role to access the workspace</p>
        </div>

        <div className={styles.roleGrid}>
          {ROLES.map((role) => (
            <button
              key={role.value}
              className={clsx(styles.roleButton, selectedRole === role.value && styles.active)}
              onClick={() => handleLogin(role.value)}
            >
              <div className={styles.iconWrapper} style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                <role.icon size={24} />
              </div>
              <div className={styles.roleInfo}>
                <span className={styles.roleName}>{role.name}</span>
                <span className={styles.roleDesc}>{role.desc}</span>
              </div>
              <ArrowRight className={styles.arrow} size={16} />
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <p>Mock Authentication System • IIIT Kota</p>
        </div>
      </div>
    </div>
  );
}
