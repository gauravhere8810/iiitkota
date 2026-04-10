"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "HEAD" | "COORDINATOR" | "CORE" | "GENERAL" | "FACULTY";

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
  loginAs: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginAs = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/proxy?email=${email}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Default to first club if available
        if (data.user.clubs.length > 0) {
          setActiveClubId(data.user.clubs[0].id);
        } else {
          setActiveClubId(null);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveClubId(null);
  };

  useEffect(() => {
    // Check local storage or default to first seed user for demo
    const savedUser = localStorage.getItem("modular_user");
    if (savedUser) {
      loginAs(savedUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("modular_user", user.email);
    } else {
      localStorage.removeItem("modular_user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, activeClubId, setActiveClubId, loginAs, logout, isLoading }}>
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
