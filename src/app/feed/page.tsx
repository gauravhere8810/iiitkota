"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Zap, 
  UserPlus, 
  Shield, 
  Package, 
  MessageCircle, 
  Vote, 
  Filter,
  Users,
  Clock,
  Activity
} from "lucide-react";
import styles from "./Feed.module.css";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, any> = {
  MEMBER_JOIN: UserPlus,
  ROLE_CHANGE: Shield,
  BOOKING_CREATE: Package,
  RESOURCE_RETURN: Package,
  CHAT_NEW: MessageCircle,
  POLL_VOTE: Vote,
};

const colorMap: Record<string, string> = {
  MEMBER_JOIN: "#10b981",
  ROLE_CHANGE: "#8b5cf6",
  BOOKING_CREATE: "#3b82f6",
  RESOURCE_RETURN: "#10b981",
  CHAT_NEW: "#ec4899",
  POLL_VOTE: "#f59e0b",
};

export default function FeedPage() {
  const { activeClubId } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeClubId) {
      setLoading(true);
      fetch(`/api/feed?clubId=${activeClubId}`)
        .then(res => res.json())
        .then(data => {
          setActivities(data.activities);
          setLoading(false);
        });
    }
  }, [activeClubId]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <div className={styles.pulseContainer}>
            <Zap size={24} className={styles.pulseIcon} />
            <div className={styles.pulseRing} />
          </div>
          <div>
            <h1>Community Pulse</h1>
            <p>Real-time activity stream of your community.</p>
          </div>
        </div>
        <div className={styles.filters}>
          <button className={clsx(styles.filterBtn, styles.active)}>All Activity</button>
          <button className={styles.filterBtn}>Members</button>
          <button className={styles.filterBtn}>Resources</button>
        </div>
      </header>

      <div className={styles.feedWrapper}>
        <div className={styles.timelineLine} />
        
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.action] || Activity;
          const color = colorMap[activity.action] || "var(--primary)";
          
          return (
            <div key={activity.id} className={styles.feedItem} style={{"--delay": `${index * 0.1}s`} as any}>
              <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20`, color: color }}>
                <Icon size={20} />
              </div>
              
              <div className={clsx(styles.content, "glass")}>
                <div className={styles.contentHeader}>
                  <div className={styles.user}>
                    <div className={styles.avatar}>{activity.user.name.charAt(0)}</div>
                    <span className={styles.userName}>{activity.user.name}</span>
                  </div>
                  <span className={styles.timestamp}>
                    <Clock size={12} /> {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <div className={styles.message}>
                  {renderActivityMessage(activity)}
                </div>

                {activity.metadata && (
                  <div className={styles.metadata}>
                    {JSON.parse(activity.metadata).details}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {activities.length === 0 && !loading && (
          <div className={styles.empty}>
            <Users size={48} />
            <h3>All quiet for now</h3>
            <p>Activities will appear here as members interact with the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderActivityMessage(activity: any) {
  switch (activity.action) {
    case "MEMBER_JOIN":
      return <span>joined the community</span>;
    case "ROLE_CHANGE":
      const meta = JSON.parse(activity.metadata || "{}");
      return <span>was promoted to <strong>{meta.newRole}</strong></span>;
    case "BOOKING_CREATE":
      return <span>requested a booking for <strong>resource #{activity.entityId}</strong></span>;
    case "POLL_VOTE":
      return <span>cast a vote in the decision poll</span>;
    default:
      return <span>performed an action</span>;
  }
}
