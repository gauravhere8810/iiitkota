"use client";

import React, { useState, useEffect } from "react";
import { useAuth, Role, ROLE_HIERARCHY } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";
import { 
  Trophy, 
  Shield, 
  Star, 
  Users, 
  User, 
  Lock, 
  ChevronRight, 
  Activity, 
  FileText, 
  Settings,
  Plus,
  Check,
  X,
  Megaphone,
  Clock
} from "lucide-react";
import styles from "./RoleDashboard.module.css";
import { clsx } from "clsx";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default function RoleDashboard({ params }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const roleSlug = resolvedParams.role;
  
  // State for Event Proposal
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDesc, setProposalDesc] = useState("");
  
  // State for Approval Popup (Club Head)
  const [pendingProposal, setPendingProposal] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  // Map slug back to enum
  const roleEnum = roleSlug.toUpperCase().replace("-", "_") as Role;
  
  useEffect(() => {
    // Load recent actions from local storage
    const stored = localStorage.getItem(`actions_${roleEnum}`);
    if (stored) setRecentActions(JSON.parse(stored));

    // For Club Head, check for pending proposals
    if (roleEnum === "CLUB_HEAD") {
      const proposal = localStorage.getItem("pending_event_proposal");
      if (proposal) {
        setPendingProposal(JSON.parse(proposal));
      }
    }
  }, [roleEnum]);

  if (!ROLE_HIERARCHY[roleEnum]) {
    return notFound();
  }

  if (!user || user.role !== roleEnum) {
    return (
      <div className={styles.locked}>
        <Lock size={48} />
        <h1>Access Restricted</h1>
        <p>You need to be logged in as a <strong>{roleEnum.replace("_", " ")}</strong> to view this portal.</p>
        <button onClick={() => router.push("/login")}>Go to Login</button>
      </div>
    );
  }

  const handlePropose = () => {
    if (!proposalTitle) return;
    const proposal = {
      id: Date.now(),
      title: proposalTitle,
      description: proposalDesc,
      from: user.name,
      status: "pending",
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("pending_event_proposal", JSON.stringify(proposal));
    
    // Add to own recent actions
    const newAction = { id: proposal.id, text: `Proposed new event: ${proposalTitle}`, type: "PROPOSAL" };
    const updated = [newAction, ...recentActions];
    setRecentActions(updated);
    localStorage.setItem(`actions_${roleEnum}`, JSON.stringify(updated));
    
    setShowProposeModal(false);
    setProposalTitle("");
    setProposalDesc("");
    alert("Proposal sent to Club Head!");
  };

  const handleApprove = (approved: boolean) => {
    if (!pendingProposal) return;
    
    const statusText = approved ? "Approved" : "Rejected";
    const newAction = { 
      id: Date.now(), 
      text: `${statusText} event idea: ${pendingProposal.title} (by ${pendingProposal.from})`,
      type: approved ? "APPROVAL" : "REJECTION" 
    };
    
    const updated = [newAction, ...recentActions];
    setRecentActions(updated);
    localStorage.setItem(`actions_${roleEnum}`, JSON.stringify(updated));
    
    // Clear proposal
    localStorage.removeItem("pending_event_proposal");
    setPendingProposal(null);
  };

  const roleConfig = {
    SAC_HEAD: { icon: Trophy, color: "#f59e0b", label: "Financials, Strategic Policy, SAC Core" },
    SAC_MEMBER: { icon: Shield, color: "#8b5cf6", label: "Inter-club Coordination, Budget Review" },
    CLUB_HEAD: { icon: Star, color: "#3b82f6", label: "Event Management, Resource Booking" },
    CORE_MEMBER: { icon: Users, color: "#10b981", label: "Internal Club Operations, Attendance" },
    STUDENT: { icon: User, color: "#6b7280", label: "Event Feed, Resource Request" },
  }[roleEnum];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.roleBadge} style={{ backgroundColor: `${roleConfig.color}20`, color: roleConfig.color }}>
          <roleConfig.icon size={16} />
          <span>{roleEnum.replace("_", " ")}</span>
        </div>
        <h1>{roleEnum.replace("_", " ")} Workspace</h1>
        <p>Manage {roleConfig.label}</p>
      </header>

      <div className={styles.grid}>
        <div className={clsx(styles.card, "glass")}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={20} />
              <h3>Recent Actions</h3>
            </div>
            {roleEnum === "CORE_MEMBER" && (
              <button className={styles.newActionBtn} onClick={() => setShowProposeModal(true)}>
                <Plus size={14} /> New Event
              </button>
            )}
          </div>
          <div className={styles.content}>
            {recentActions.map(action => (
              <div key={action.id} className={styles.notification}>
                <div className={styles.notifInfo}>
                  <h4>{action.text}</h4>
                  <p>Just now • Club Pipeline</p>
                </div>
              </div>
            ))}
            {recentActions.length === 0 && (
              <p className={styles.empty}>No recent activity in your workspace.</p>
            )}
          </div>
        </div>

        <div className={clsx(styles.card, "glass")}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} />
              <h3>Assigned Tasks</h3>
            </div>
          </div>
          <div className={styles.content}>
            <ul className={styles.taskList}>
              <li>
                <ChevronRight size={14} />
                <span>Verify quarterly budget reports</span>
              </li>
              <li>
                <ChevronRight size={14} />
                <span>Approve upcoming tech-fest events</span>
              </li>
            </ul>
          </div>
        </div>

        {roleEnum === "CLUB_HEAD" && (
          <div className={clsx(styles.card, "glass", styles.span2)}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Megaphone size={20} style={{ color: '#3b82f6' }} />
                <h3>Pending Event Proposals</h3>
              </div>
              <span className={styles.pendingCount}>{pendingProposal ? 1 : 0} Requests</span>
            </div>
            <div className={styles.content}>
              {pendingProposal ? (
                <div className={styles.requestSlot}>
                  <div className={styles.requestMain}>
                    <div className={styles.requestTitle}>
                      <h4>{pendingProposal.title}</h4>
                      <span>Proposed by {pendingProposal.from}</span>
                    </div>
                    <p>{pendingProposal.description}</p>
                  </div>
                  <div className={styles.requestActions}>
                    <button className={styles.rejectBtn} onClick={() => handleApprove(false)}>
                      <X size={16} /> Reject
                    </button>
                    <button className={styles.approveBtn} onClick={() => handleApprove(true)}>
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.empty}>No pending proposals to review at this time.</p>
              )}
            </div>
          </div>
        )}

        <div className={clsx(styles.card, "glass", styles.span2)}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={20} />
              <h3>Role-Based Controls</h3>
            </div>
          </div>
          <div className={styles.controls}>
             {ROLE_HIERARCHY[roleEnum] >= 5 && (
               <div className={styles.controlItem}>
                 <h4>Administrative Oversight</h4>
                 <p>Global budget allocation and constitutional modifications.</p>
                 <button className={styles.actionBtn}>Open Panel</button>
               </div>
             )}
             {ROLE_HIERARCHY[roleEnum] >= 3 && (
               <div className={styles.controlItem}>
                 <h4>Leadership Tools</h4>
                 <p>Resource approval and core member evaluation.</p>
                 <button className={styles.actionBtn}>Manage Team</button>
               </div>
             )}
             <div className={styles.controlItem}>
               <h4>General Access</h4>
               <p>Access your personal profile and registered interest groups.</p>
               <button className={styles.actionBtn}>View Profile</button>
             </div>
          </div>
        </div>
      </div>

      {/* CORE MEMBER: Propose Event Modal */}
      {showProposeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Propose New Event</h2>
            <div className={styles.inputGroup}>
              <label>Event Title</label>
              <input 
                type="text" 
                placeholder="e.g. Hackathon 2026" 
                value={proposalTitle} 
                onChange={e => setProposalTitle(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea 
                rows={3} 
                placeholder="Explain the vision..." 
                value={proposalDesc} 
                onChange={e => setProposalDesc(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowProposeModal(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handlePropose}>Send Proposal</button>
            </div>
          </div>
        </div>
      )}

      {/* Note: The Club Head popup was replaced by a dedicated slot in the grid above */}
    </div>
  );
}
