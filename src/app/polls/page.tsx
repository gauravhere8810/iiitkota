"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  TrendingUp,
  X,
  Loader2
} from "lucide-react";
import styles from "./Polls.module.css";
import { clsx } from "clsx";

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: Option[];
  totalVotes: number;
  expiresAt: string;
  hasVoted: boolean;
}

export default function PollsPage() {
  const { user, activeClubId } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC: Only roles above STUDENT can post
  const canPostPoll = user && user.role !== "STUDENT";
  
  const [showForm, setShowForm] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  const [newPollExpires, setNewPollExpires] = useState("2026-12-31");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPolls = async () => {
    if (!activeClubId || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/polls?clubId=${activeClubId}&userId=${user.id}`);
      const data = await res.json();
      if (data.polls) setPolls(data.polls);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [activeClubId, user]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) return;
    
    // Optimistic Update
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          hasVoted: true,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
        };
      }
      return p;
    }));

    try {
      await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionId, userId: user.id })
      });
    } catch(e) {
      console.error(e);
      fetchPolls(); // revert if failed
    }
  };

  const updateOption = (index: number, val: string) => {
    const opts = [...newPollOptions];
    opts[index] = val;
    setNewPollOptions(opts);
  };

  const handleCreatePoll = async () => {
    if (!user || user.role === "STUDENT" || !newPollTitle) return;
    
    const validOptions = newPollOptions.filter(o => o.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please provide at least 2 valid options.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           clubId: activeClubId || "club-1",
           userId: user.id,
           userRole: user.role,
           title: newPollTitle,
           description: newPollDesc,
           options: validOptions,
           expiresAt: newPollExpires
        })
      });
      setShowForm(false);
      setNewPollTitle("");
      setNewPollDesc("");
      setNewPollOptions(["", ""]);
      fetchPolls();
    } catch(e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Decision Center</h1>
          <p>Democratic coordination for club activities and policies.</p>
        </div>
        {canPostPoll && !showForm && (
          <button className={styles.createBtn} onClick={() => setShowForm(true)}>
            <Plus size={20} /> New Poll
          </button>
        )}
      </header>

      {showForm && (
        <div className={clsx(styles.pollCard, "glass")} style={{ borderColor: 'var(--primary)', marginBottom: '1rem' }}>
          <div className={styles.cardHeader}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Create a New Poll</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Poll Title" 
              value={newPollTitle} 
              onChange={e => setNewPollTitle(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem' }} 
            />
            <textarea 
              placeholder="Description (Optional)" 
              value={newPollDesc} 
              onChange={e => setNewPollDesc(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px', fontFamily: 'inherit' }} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Options</label>
              {newPollOptions.map((opt, i) => (
                <input 
                  key={i} 
                  type="text" 
                  placeholder={`Option ${i + 1}`} 
                  value={opt} 
                  onChange={e => updateOption(i, e.target.value)} 
                  style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} 
                />
              ))}
              {newPollOptions.length < 5 && (
                <button 
                  onClick={() => setNewPollOptions([...newPollOptions, ""])} 
                  style={{ alignSelf: 'flex-start', padding: '0.5rem', background: 'transparent', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  + Add Option
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Expires At</label>
              <input 
                type="date" 
                value={newPollExpires} 
                onChange={e => setNewPollExpires(e.target.value)} 
                style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} 
              />
            </div>
            
            <button 
              onClick={handleCreatePoll} 
              disabled={isSubmitting || !newPollTitle} 
              className={styles.createBtn} 
              style={{ alignSelf: 'flex-end', marginTop: '1rem', opacity: isSubmitting || !newPollTitle ? 0.5 : 1 }}
            >
              {isSubmitting ? <Loader2 size={16} className={styles.spin} /> : 'Post Poll'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : polls.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
          <p>No active polls currently.</p>
        </div>
      ) : (
        <div className={styles.pollGrid}>
          {polls.map((poll) => (
            <div key={poll.id} className={clsx(styles.pollCard, "glass")}>
              <div className={styles.cardHeader}>
                <div className={styles.pollStatus}>
                  <Clock size={14} /> Ends {poll.expiresAt}
                </div>
                <div className={styles.voterCount}>
                  <Users size={14} /> {poll.totalVotes} votes cast
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3>{poll.title}</h3>
                {poll.description && <p>{poll.description}</p>}

                <div className={styles.optionsList}>
                  {poll.options.map((opt) => {
                    const percentage = poll.totalVotes > 0 
                      ? Math.round((opt.votes / poll.totalVotes) * 100) 
                      : 0;
                    
                    return (
                      <button 
                        key={opt.id} 
                        className={clsx(styles.optionBtn, poll.hasVoted && styles.votedState)}
                        disabled={poll.hasVoted}
                        onClick={() => handleVote(poll.id, opt.id)}
                      >
                        <div className={styles.optionContent}>
                          <span className={styles.optionText}>{opt.text}</span>
                          {poll.hasVoted && <span className={styles.optionPercent}>{percentage}%</span>}
                        </div>
                        {poll.hasVoted && (
                          <div 
                            className={styles.progressBar} 
                            style={{ width: `${percentage}%` }} 
                          />
                        )}
                        {poll.hasVoted && opt.votes > 0 && opt.votes === Math.max(...poll.options.map(o => o.votes)) && (
                          <TrendingUp size={14} className={styles.winnerIcon} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.cardFooter}>
                {poll.hasVoted ? (
                  <div className={styles.votedNotice}>
                    <CheckCircle2 size={16} /> You have already voted in this poll
                  </div>
                ) : (
                  <div className={styles.actionNotice}>
                    Select an option to cast your vote <ChevronRight size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
