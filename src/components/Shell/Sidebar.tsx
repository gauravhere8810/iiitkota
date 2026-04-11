"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Users, 
  Layers, 
  Package, 
  Activity, 
  MessageSquare, 
  Vote, 
  Bell, 
  Settings,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Megaphone
} from "lucide-react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Members", href: "/members", icon: Users },
  { name: "Resources", href: "/resources", icon: Package },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Polls", href: "/polls", icon: Vote },
];

export default function Sidebar() {
  const { user, activeClubId, setActiveClubId } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const pathname = usePathname();

  const activeClub = user?.clubs.find(c => c.id === activeClubId);

  return (
    <aside className={clsx(styles.sidebar, "glass")}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>M</div>
        <span className={styles.logoText}>Modular Commons</span>
      </div>

      <div className={styles.clubSwitcher}>
        <button 
          className={styles.clubButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className={styles.clubAccent} style={{ backgroundColor: activeClub?.id ? (activeClub as any).accentColor || "#3b82f6" : "#94a3b8" }} />
          <div className={styles.clubInfo}>
            <span className={styles.clubName}>{activeClub?.name || "Select Club"}</span>
            <span className={styles.clubRole}>{activeClub?.role || "Member"}</span>
          </div>
          <ChevronDown size={16} className={clsx(styles.chevron, isDropdownOpen && styles.chevronRotate)} />
        </button>
        
        {isDropdownOpen && (
          <div className={clsx(styles.clubDropdown, "glass")}>
            {user?.clubs.map((club) => (
              <button 
                key={club.id} 
                className={clsx(styles.dropdownItem, activeClubId === club.id && styles.active)}
                onClick={() => {
                  setActiveClubId(club.id);
                  setIsDropdownOpen(false);
                }}
              >
                <div className={styles.dropdownName} style={{ color: (club as any).accentColor }}>{club.name}</div>
                <span className={styles.roleTag}>{club.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          if (item.name === "Chat" && user?.role === "STUDENT") return null;
          
          const Icon = item.icon;
          const href = (item.name === "Dashboard" && user?.role) 
            ? `/dashboard/${user.role.toLowerCase().replace("_", "-")}` 
            : item.href;
          const isActive = pathname === href || (item.name === "Dashboard" && pathname.startsWith("/dashboard/"));
          return (
            <Link 
              key={item.href} 
              href={href} 
              className={clsx(styles.navItem, isActive && styles.navActive)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/settings" className={styles.navItem}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link href="/profile" className={styles.userProfileLink}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user?.name.charAt(0)}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
