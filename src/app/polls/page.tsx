"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  BarChart2, 
  Clock, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  TrendingUp
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

  useEffect(() => {
    // Mock data for demo
    setPolls([
      {
        id: "p1",
        title: "Choice of Venue for Annual Tech Fest 2026",
        description: "Vote for the location that best suits our requirements.",
        totalVotes: 84,
        expiresAt: "2026-04-15",
        hasVoted: false,
        options: [
          { id: "o1", text: "Main Auditorium", votes: 45 },
          { id: "o2", text: "Open Air Theater", votes: 20 },
          { id: "o3", text: "Innovation Hall", votes: 19 },
        ]
      },
      {
        id: "p2",
        title: "New Club Logo Concept",
        description: "Select the concept that represents our club's identity best.",
        totalVotes: 120,
        expiresAt: "2026-04-20",
        hasVoted: true,
        options: [
          { id: "o4", text: "Minimalist Vector", votes: 75 },
          { id: "o5", text: "Classic Emblem", votes: 45 },
        ]
      }
    ]);
    setLoading(false);
  }, [activeClubId]);

  const handleVote = (pollId: string, optionId: string) => {
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
    // Simulate real-time update logic
    console.log("POLL_VOTE event triggered");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Decision Center</h1>
          <p>Democratic coordination for club activities and policies.</p>
        </div>
        <button className={styles.createBtn}>
          <Plus size={20} /> New Poll
        </button>
      </header>

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
              <p>{poll.description}</p>

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
                        <span className={styles.optionPercent}>{percentage}%</span>
                      </div>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${percentage}%` }} 
                      />
                      {poll.hasVoted && opt.votes === Math.max(...poll.options.map(o => o.votes)) && (
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
    </div>
  );
}
