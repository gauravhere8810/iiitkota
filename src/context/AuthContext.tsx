"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "SAC_HEAD" | "SAC_MEMBER" | "CLUB_HEAD" | "CORE_MEMBER" | "STUDENT";

export const ROLE_HIERARCHY: Record<Role, number> = {
  SAC_HEAD: 5,
  SAC_MEMBER: 4,
  CLUB_HEAD: 3,
  CORE_MEMBER: 2,
  STUDENT: 1,
};

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role; // Primary role for current context
  clubs: { id: string; name: string; role: Role }[];
}

interface AuthContextType {
  user: User | null;
  activeClubId: string | null;
  setActiveClubId: (id: string) => void;
  loginAsRole: (role: Role, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginAsRole = async (role: Role, name?: string) => {
    setIsLoading(true);
    try {
      let realClubId = "club-1";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`/api/auth/proxy?email=coding.head@uni.edu`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.user && data.user.clubs.length > 0) {
          realClubId = data.user.clubs[0].id;
        }
      } catch(e) {
        console.warn("Proxy fetch aborted or failed, falling back to club-1", e);
      }
      
      const displayName = name || localStorage.getItem("modular_display_name") || `Mock ${role.replace("_", " ")}`;
      if (name) localStorage.setItem("modular_display_name", name);

      const mockUser: User = {
        id: `mock-${(role || "STUDENT").toLowerCase()}-${Date.now()}`,
        name: displayName,
        email: `${(role || "STUDENT").toLowerCase()}@iiitkota.ac.in`,
        role: role || "STUDENT",
        clubs: [{ id: realClubId, name: "Modular App Club", role: role || "STUDENT" }],
      };
      
      setUser(mockUser);
      if (mockUser.clubs.length > 0) {
        setActiveClubId(mockUser.clubs[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveClubId(null);
    localStorage.removeItem("modular_user_role");
  };

  useEffect(() => {
    // Check local storage or default to first seed user for demo
    const savedRole = localStorage.getItem("modular_user_role") as Role;
    if (savedRole) {
      loginAsRole(savedRole);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("modular_user", user.email);
      localStorage.setItem("modular_user_role", user.role);
    } else {
      localStorage.removeItem("modular_user");
      localStorage.removeItem("modular_user_role");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, activeClubId, setActiveClubId, loginAsRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
