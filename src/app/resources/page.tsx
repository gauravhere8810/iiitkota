"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Filter, 
  QrCode, 
  Info, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import styles from "./Resources.module.css";
import { clsx } from "clsx";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  location: string;
  qrCode: string;
}

export default function ResourcesPage() {
  const { user, activeClubId } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  
  // States for Booking Modal
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showQR, setShowQR] = useState<Resource | null>(null);

  useEffect(() => {
    if (activeClubId) {
      setLoading(true);
      fetch(`/api/resources?clubId=${activeClubId}`)
        .then(res => res.json())
        .then(data => {
          setResources(data.resources);
          setLoading(false);
        });
    }
  }, [activeClubId]);

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Resource Hub</h1>
          <p>Orchestrate and manage shared community assets.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Filter resources..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {["ALL", "PHYSICAL", "SPACE", "DIGITAL"].map(f => (
              <button 
                key={f}
                className={clsx(styles.filterBtn, filter === f && styles.filterActive)}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.resourceGrid}>
        {filteredResources.map((resource) => (
          <div key={resource.id} className={clsx(styles.card, "glass")}>
            <div className={styles.cardHeader}>
              <div className={styles.typeTag}>{resource.type}</div>
              <div className={styles.statusTag} data-status={resource.status}>
                {resource.status === "AVAILABLE" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {resource.status}
              </div>
            </div>
            
            <div className={styles.cardBody}>
              <h3>{resource.name}</h3>
              <p className={styles.desc}>{resource.description}</p>
              
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <MapPin size={14} /> <span>{resource.location || "On-site"}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button 
                className={styles.qrBtn}
                onClick={() => setShowQR(resource)}
                title="View QR Code"
              >
                <QrCode size={18} />
              </button>
              <button 
                className={styles.bookBtn}
                disabled={resource.status !== "AVAILABLE"}
                onClick={() => setSelectedResource(resource)}
              >
                {resource.status === "AVAILABLE" ? "Book Now" : "Waitlist"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Simulation Modal */}
      {showQR && (
        <div className={styles.modalOverlay} onClick={() => setShowQR(null)}>
          <div className={clsx(styles.qrModal, "glass")} onClick={e => e.stopPropagation()}>
            <div className={styles.qrHeader}>
              <h3>Resource QR Code</h3>
              <p>{showQR.name}</p>
            </div>
            <div className={styles.qrContent}>
              <div className={styles.qrPlaceholder}>
                <QrCode size={160} strokeWidth={1} />
                <div className={styles.qrIndicator}>SCAN TO CHECK-IN/OUT</div>
              </div>
              <div className={styles.qrCodeText}>{showQR.qrCode}</div>
            </div>
            <button className={styles.simulateScanBtn} onClick={() => {
              alert("SIMULATION: Scanning QR... Redirecting to action page.");
              setShowQR(null);
            }}>
              Simulate Mobile Scan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal Simulation */}
      {selectedResource && (
        <div className={styles.modalOverlay} onClick={() => setSelectedResource(null)}>
          <div className={clsx(styles.bookingModal, "glass")} onClick={e => e.stopPropagation()}>
            <h3>Reserve {selectedResource.name}</h3>
            <div className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className={styles.formGroup}>
                <label>Time Slot</label>
                <div className={styles.slots}>
                  {["09:00", "11:00", "13:00", "15:00"].map(t => (
                    <button key={t} className={styles.slotBtn}>{t}</button>
                  ))}
                </div>
              </div>
              <div className={styles.conflictWarn}>
                <AlertTriangle size={14} />
                <span>Simulated Check: 2 members on waitlist for this slot.</span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setSelectedResource(null)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={() => {
                alert("Booking Request Sent! Triggering live feed update...");
                setSelectedResource(null);
              }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
