"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        // In a real app, go to /login. For this proxy demo, we'll auto-login as first user or stay on home
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050507", color: "white" }}>
      <p style={{ animation: "pulse 2s infinite" }}>Loading Modular Commons...</p>
    </div>
  );
}
