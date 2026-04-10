"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  UserCircle, 
  Mail, 
  Calendar, 
  Shield, 
  MoreHorizontal,
  Filter
} from "lucide-react";
import styles from "./Members.module.css";
import { clsx } from "clsx";
import { format } from "date-fns";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
  bio?: string;
}

export default function MembersPage() {
  const { activeClubId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (activeClubId) {
      setLoading(true);
      fetch(`/api/members?clubId=${activeClubId}`)
        .then(res => res.json())
        .then(data => {
          setMembers(data.members);
          setLoading(false);
        });
    }
  }, [activeClubId]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Community Members</h1>
          <p>Manage and connect with members of your club ecosystem.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.filterBtn}>
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className={styles.memberGrid}>
        {filteredMembers.map((member) => (
          <div key={member.id} className={clsx(styles.card, "glass")}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              <div className={styles.roleBadge} data-role={member.role}>
                {member.role === "HEAD" || member.role === "FACULTY" ? <Shield size={12} /> : null}
                {member.role}
              </div>
              <button className={styles.moreBtn}><MoreHorizontal size={18} /></button>
            </div>

            <div className={styles.cardMain}>
              <h3>{member.name}</h3>
              <div className={styles.email}>
                <Mail size={14} /> <span>{member.email}</span>
              </div>
              <p className={styles.bio}>{member.bio || "No bio provided"}</p>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.joinDate}>
                <Calendar size={14} /> 
                <span>Joined {format(new Date(member.joinedAt), "MMM yyyy")}</span>
              </div>
              <button className={styles.profileBtn}>View Profile</button>
            </div>
          </div>
        ))}

        {!loading && filteredMembers.length === 0 && (
          <div className={styles.empty}>
            <UserCircle size={48} />
            <h3>No members found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
