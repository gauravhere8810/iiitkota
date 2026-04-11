"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Filter, 
  Info, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  ShieldCheck,
  Loader2
} from "lucide-react";
import styles from "./Resources.module.css";
import { clsx } from "clsx";
import { supabase } from "@/lib/supabase";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  location: string;
}

interface ResourceRequest {
  id: string;
  resourceId: string;
  resourceName: string;
  requesterId: string;
  requesterName: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function ResourcesPage() {
  const { user, activeClubId } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Request modal state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [requestDuration, setRequestDuration] = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Add Resource modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("PHYSICAL");
  const [newLocation, setNewLocation] = useState("");

  // Approval panel state
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [showApprovals, setShowApprovals] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const activeClub = user?.clubs.find(c => c.id === activeClubId);
  const isApprover = activeClub?.role === "SAC_HEAD" || activeClub?.role === "CLUB_HEAD";
  const isAuthorized = isApprover || activeClub?.role === "SAC_MEMBER" || activeClub?.role === "FACULTY";

  // Real-time synchronization for Resources Page
  useEffect(() => {
    const sub = supabase.channel('resource-page-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (payload.new.channel === 'RESOURCE_ALERTS') {
          // Whenever an alert or status update occurs, refresh local data
          setRefreshKey(k => k + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); }
  }, []);

  useEffect(() => {
    if (activeClubId) {
      setLoading(true);
      fetch(`/api/resources?clubId=${activeClubId}&_ts=${refreshKey}`)
        .then(res => res.json())
        .then(data => {
          setResources(data.resources);
          setLoading(false);
        });
    }
  }, [activeClubId, refreshKey]);

  // Fetch pending requests for approvers
  useEffect(() => {
    if (isApprover && activeClubId) {
      fetch(`/api/resources/request?clubId=${activeClubId}&_ts=${refreshKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.requests) setRequests(data.requests);
        });
    }
  }, [isApprover, activeClubId, refreshKey]);

  const handleCreateResource = async () => {
    if (!newName || !activeClubId) return;
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, type: newType, location: newLocation, clubId: activeClubId })
    });
    const data = await res.json();
    if (data.resource) {
      setResources([data.resource, ...resources]);
      setShowAddModal(false);
      setNewName("");
      setNewLocation("");
    }
  };

  const handleRequestResource = async () => {
    if (!selectedResource || !requestReason.trim() || !activeClubId || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/resources/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          clubId: activeClubId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          reason: requestReason,
          duration: requestDuration
        })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Use a guaranteed physical INSERT into chat_messages to trigger Realtime on all devices flawlessly
        await supabase.from("chat_messages").insert([
          {
            sender_id: user.id,
            sender_name: "SYSTEM",
            channel: "RESOURCE_ALERTS",
            content: JSON.stringify({
              id: data.request.id,
              requesterName: user.name,
              resourceName: selectedResource.name,
              reason: requestReason,
              clubId: activeClubId
            })
          }
        ]);

        setRequestSuccess(true);
        setTimeout(() => {
          setSelectedResource(null);
          setRequestReason("");
          setRequestDuration(24);
          setRequestSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    setApprovingId(requestId);
    try {
      await fetch("/api/resources/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action })
      });
      const targetReq = requests.find(r => r.id === requestId);
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action } : r));
      
      // Notify all devices to refresh UI
      await supabase.from("chat_messages").insert([{
        sender_id: user?.id || "SYSTEM",
        sender_name: "SYSTEM",
        channel: "RESOURCE_ALERTS",
        content: JSON.stringify({ 
          type: "STATUS_UPDATE",
          id: requestId,
          requesterId: targetReq?.requesterId,
          resourceName: targetReq?.resourceName,
          newStatus: action
        })
      }]);
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingRequests = requests.filter(r => r.status === "PENDING");

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
            {isAuthorized && (
              <button 
                className={clsx(styles.filterBtn, styles.addBtn)} 
                onClick={() => setShowAddModal(true)}
              >
                + Add Resource
              </button>
            )}
            {isApprover && pendingRequests.length > 0 && (
              <button 
                className={clsx(styles.filterBtn, styles.approvalToggle)} 
                onClick={() => setShowApprovals(!showApprovals)}
              >
                <ShieldCheck size={14} />
                {pendingRequests.length} Pending
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Approval Panel for SAC_HEAD / CLUB_HEAD */}
      {showApprovals && isApprover && (
        <div className={clsx(styles.approvalPanel, "glass")}>
          <h3><ShieldCheck size={18} /> Pending Approvals</h3>
          {pendingRequests.length === 0 ? (
            <p className={styles.emptyApprovals}>No pending requests.</p>
          ) : (
            <div className={styles.approvalList}>
              {pendingRequests.map(req => (
                <div key={req.id} className={styles.approvalItem}>
                  <div className={styles.approvalInfo}>
                    <strong>{req.requesterName}</strong>
                    <span>requests</span>
                    <strong>{req.resourceName}</strong>
                  </div>
                  <p className={styles.approvalReason}>"{req.reason}"</p>
                  <div className={styles.approvalActions}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleApproval(req.id, "APPROVED")}
                      disabled={approvingId === req.id}
                    >
                      {approvingId === req.id ? <Loader2 size={14} className={styles.spin} /> : <CheckCircle2 size={14} />}
                      Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleApproval(req.id, "REJECTED")}
                      disabled={approvingId === req.id}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                className={styles.bookBtn}
                disabled={resource.status !== "AVAILABLE"}
                onClick={() => setSelectedResource(resource)}
              >
                {resource.status === "AVAILABLE" ? (
                  <><Send size={14} /> Request Access</>
                ) : (
                  "Unavailable"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Access Modal */}
      {selectedResource && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedResource(null); setRequestSuccess(false); setRequestReason(""); setRequestDuration(24); }}>
          <div className={clsx(styles.bookingModal, "glass")} onClick={e => e.stopPropagation()}>
            {requestSuccess ? (
              <div className={styles.successState}>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h3>Request Submitted!</h3>
                <p>Your request has been sent to leadership for approval.</p>
              </div>
            ) : (
              <>
                <h3>Request: {selectedResource.name}</h3>
                <div className={styles.bookingForm}>
                  <div className={styles.resourceInfo}>
                    <div className={styles.metaItem}><MapPin size={14} /> {selectedResource.location || "On-site"}</div>
                    <div className={styles.metaItem}><Info size={14} /> {selectedResource.type}</div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Reason for Request</label>
                    <textarea 
                      placeholder="Briefly explain why you need this resource..."
                      value={requestReason}
                      onChange={e => setRequestReason(e.target.value)}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Usage Duration</label>
                    <select 
                      value={requestDuration} 
                      onChange={e => setRequestDuration(Number(e.target.value))}
                      className={styles.select}
                    >
                      <option value={1}>1 Hour</option>
                      <option value={4}>4 Hours</option>
                      <option value={8}>8 Hours</option>
                      <option value={24}>1 Day</option>
                      <option value={48}>2 Days</option>
                      <option value={168}>1 Week</option>
                    </select>
                  </div>
                  <div className={styles.conflictWarn}>
                    <AlertTriangle size={14} />
                    <span>Your request will be reviewed by leadership. After approval, access is granted for the selected duration.</span>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => { setSelectedResource(null); setRequestReason(""); setRequestDuration(24); }}>Cancel</button>
                  <button 
                    className={styles.confirmBtn} 
                    onClick={handleRequestResource}
                    disabled={!requestReason.trim() || submitting}
                  >
                    {submitting ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
                    Submit Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={clsx(styles.bookingModal, "glass")} onClick={e => e.stopPropagation()}>
            <h3>Add New Resource</h3>
            <div className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label>Resource Name</label>
                <input type="text" placeholder="e.g. 3D Printer" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Resource Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                  <option value="PHYSICAL">Physical Asset</option>
                  <option value="SPACE">Workspace</option>
                  <option value="DIGITAL">Digital Access</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input type="text" placeholder="e.g. Lab 4B" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className={styles.confirmBtn} style={{ background: "var(--primary)" }} onClick={handleCreateResource}>Create Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
