"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Calendar, 
  Announcement, 
  ArrowUpRight, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { clsx } from "clsx";

interface DashboardData {
  memberCount: number;
  activeResources: number;
  upcomingEvents: any[];
  recentAnnouncements: any[];
  pendingRequests?: number;
}

export default function Dashboard() {
  const { user, activeClubId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const isLeader = activeClub?.role === "HEAD" || activeClub?.role === "COORDINATOR";

  useEffect(() => {
    if (activeClubId) {
      setLoading(true);
      fetch(`/api/dashboard?clubId=${activeClubId}`)
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        });
    }
  }, [activeClubId]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>Welcome back, {user?.name.split(" ")[0]}</h1>
          <p>Here's what's happening in <strong>{activeClub?.name}</strong> today.</p>
        </div>
        <div className={styles.stats}>
          <div className={clsx(styles.statCard, "glass")}>
            <Users size={20} className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Members</span>
              <span className={styles.statValue}>{data?.memberCount || 0}</span>
            </div>
            <TrendingUp size={16} className={styles.trend} />
          </div>
          <div className={clsx(styles.statCard, "glass")}>
            <Calendar size={20} className={styles.statIcon} style={{ color: "var(--primary)" }} />
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Resources</span>
              <span className={styles.statValue}>{data?.activeResources || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={clsx(styles.mainSection, "glass")}>
          <div className={styles.sectionHeader}>
            <h3>Upcoming Events</h3>
            <button className={styles.viewAll}>View Calendar <ArrowUpRight size={14} /></button>
          </div>
          <div className={styles.eventList}>
            {data?.upcomingEvents.map((event: any) => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.day}>{new Date(event.startTime).getDate()}</span>
                  <span className={styles.month}>{new Date(event.startTime).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className={styles.eventInfo}>
                  <h4>{event.title}</h4>
                  <p>{event.venue} • {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className={styles.regCount}>
                  {event.maxAttendees ? `${event._count?.registrations || 0}/${event.maxAttendees}` : "Unlimited"}
                </div>
              </div>
            ))}
            {(!data?.upcomingEvents || data.upcomingEvents.length === 0) && (
              <p className={styles.empty}>No upcoming events found.</p>
            )}
          </div>
        </section>

        <section className={clsx(styles.sideSection, "glass")}>
          <div className={styles.sectionHeader}>
            <h3>Announcements</h3>
          </div>
          <div className={styles.announcementList}>
            {data?.recentAnnouncements.map((ann: any) => (
              <div key={ann.id} className={styles.annItem}>
                <div className={styles.annBadge} data-priority={ann.priority}>
                  {ann.priority}
                </div>
                <h4>{ann.title}</h4>
                <p>{ann.content.substring(0, 60)}...</p>
                <div className={styles.annMeta}>
                  <Clock size={12} /> {new Date(ann.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {isLeader && (
          <section className={clsx(styles.approvalSection, "glass")}>
            <div className={styles.sectionHeader}>
              <h3>Pending Approvals</h3>
              <span className={styles.pendingCount}>{data?.pendingRequests || 0}</span>
            </div>
            <div className={styles.reqList}>
              <div className={styles.reqItem}>
                <AlertCircle size={16} style={{ color: "var(--accent)" }} />
                <div className={styles.reqInfo}>
                  <p><strong>Charlie Dev</strong> requested <strong>Innovation Lab</strong></p>
                  <span>2 hours ago</span>
                </div>
                <div className={styles.reqActions}>
                  <button className={styles.approveBtn}><CheckCircle2 size={16} /></button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
