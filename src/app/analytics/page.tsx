"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  AlertCircle, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import styles from "./Analytics.module.css";
import { clsx } from "clsx";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("Weekly");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Intelligence & Insights</h1>
          <p>Analyzing community patterns and resource optimization.</p>
        </div>
        <div className={styles.timeFilter}>
          {["Daily", "Weekly", "Monthly"].map(t => (
            <button 
              key={t} 
              className={clsx(styles.timeBtn, timeframe === t && styles.activeTime)}
              onClick={() => setTimeframe(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.statGrid}>
        <div className={clsx(styles.mainCard, "glass")}>
          <div className={styles.cardHeader}>
            <h3>Resource Utilization Heatmap</h3>
            <span className={styles.badge}>MOCK REAL-TIME</span>
          </div>
          <div className={styles.heatmap}>
            <div className={styles.heatmapY}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            </div>
            <div className={styles.heatmapGrid}>
              {Array.from({ length: 91 }).map((_, i) => (
                <div 
                  key={i} 
                  className={styles.cell} 
                  style={{ opacity: 0.1 + (Math.random() * 0.9) }}
                  title="Utilization Level"
                />
              ))}
            </div>
          </div>
          <div className={styles.heatmapLabel}>
            <span>Low Usage</span>
            <div className={styles.legend} />
            <span>Peak Usage</span>
          </div>
        </div>

        <div className={clsx(styles.aiInsights, "glass")}>
          <div className={styles.cardHeader}>
            <Sparkles size={18} className={styles.aiIcon} />
            <h3>AI Predictive Insights</h3>
          </div>
          <div className={styles.insightList}>
            <div className={styles.insightItem}>
              <Zap size={16} />
              <p><strong>Optimization:</strong> Shift Coding Lab sessions to Tuesdays to reduce Monday peak by 40%.</p>
            </div>
            <div className={styles.insightItem}>
              <TrendingUp size={16} />
              <p><strong>Expansion:</strong> Photography club demand is up 25%. Suggest acquiring another Sony A7IV.</p>
            </div>
            <div className={styles.insightItem}>
              <AlertCircle size={16} />
              <p><strong>Conflict:</strong> 3 overlapping bookings detected for Friday. Reassigning lab slots based on priority.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={clsx(styles.subCard, "glass")}>
          <h3>Peak Usage Hours</h3>
          <div className={styles.barChart}>
            {[40, 60, 80, 100, 70, 30].map((h, i) => (
              <div key={i} className={styles.barWrapper}>
                <div className={styles.bar} style={{ height: `${h}%` }} />
                <span className={styles.label}>{9 + (i * 2)}:00</span>
              </div>
            ))}
          </div>
        </div>

        <div className={clsx(styles.subCard, "glass")}>
          <h3>Resource Efficiency</h3>
          <div className={styles.resourceList}>
            {[
              { name: "Innovation Lab", efficiency: 94 },
              { name: "Sony A7IV", efficiency: 78 },
              { name: "Industrial Arm", efficiency: 42 },
            ].map(r => (
              <div key={r.name} className={styles.row}>
                <span>{r.name}</span>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${r.efficiency}%`, backgroundColor: r.efficiency > 80 ? "var(--primary)" : r.efficiency > 50 ? "var(--accent)" : "var(--destructive)" }} />
                </div>
                <span className={styles.percent}>{r.efficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
