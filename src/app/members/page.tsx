"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  UserCircle, 
  Mail, 
  Calendar, 
  Shield, 
  Filter,
  X
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
  skills?: string;
}

const getRank = (role: string) => {
  switch (role) {
    case "FACULTY": return 1;
    case "HEAD": return 2;
    case "COORDINATOR": return 3;
    case "CORE": return 4;
    case "GENERAL": return 5;
    default: return 99;
  }
};

export default function MembersPage() {
  const { user, activeClubId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [showFilterOpts, setShowFilterOpts] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  const currentClubRole = user?.clubs.find(c => c.id === activeClubId)?.role || "GENERAL";
  const currentRank = getRank(currentClubRole);

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

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.email.toLowerCase().includes(search.toLowerCase()) ||
                          m.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterRole === "ALL" || m.role === filterRole;
    return matchesSearch && matchesFilter;
  });

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
          <div style={{ position: "relative" }}>
            <button 
              className={clsx(styles.filterBtn, filterRole !== "ALL" && styles.filterActive)}
              onClick={() => setShowFilterOpts(!showFilterOpts)}
            >
              <Filter size={18} /> {filterRole !== "ALL" && <span>{filterRole}</span>}
            </button>
            {showFilterOpts && (
              <div className={styles.filterMenu}>
                {["ALL", "FACULTY", "HEAD", "COORDINATOR", "CORE", "GENERAL"].map(role => (
                  <button 
                    key={role} 
                    className={styles.filterMenuItem}
                    onClick={() => { setFilterRole(role); setShowFilterOpts(false); }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <div style={{ position: "relative" }}>
                <button 
                  className={styles.moreBtn}
                  onClick={() => setOpenDropdownId(openDropdownId === member.id ? null : member.id)}
                >
                  <MoreHorizontal size={18} />
                </button>
                {openDropdownId === member.id && (
                  <div className={styles.actionMenu}>
                    {currentRank < getRank(member.role) ? (
                      <button 
                        className={styles.actionItemDanger}
                        onClick={() => {
                          alert(`Simulated Action: Restricted ${member.name} from the club pipeline.`);
                          setMembers(members.filter(m => m.id !== member.id));
                          setOpenDropdownId(null);
                        }}
                      >
                        Remove Member
                      </button>
                    ) : (
                      <div className={styles.actionItemDisabled}>
                        No administrative actions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.cardMain}>
              <h3>{member.name}</h3>
              <div className={styles.email}>
                <Mail size={14} /> <span>{member.email}</span>
              </div>
              <p className={styles.bio}>{member.bio || "No bio provided"}</p>
              {member.skills && (
                <div className={styles.tagList}>
                  {member.skills.split(',').slice(0, 3).map((skill, idx) => (
                    <span key={idx} className={styles.tag}>{skill.trim()}</span>
                  ))}
                  {member.skills.split(',').length > 3 && <span className={styles.tag}>+{member.skills.split(',').length - 3}</span>}
                </div>
              )}
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.joinDate}>
                <Calendar size={14} /> 
                <span>Joined {format(new Date(member.joinedAt), "MMM yyyy")}</span>
              </div>
              <button 
                className={styles.profileBtn}
                onClick={() => setViewingMember(member)}
              >
                View Profile
              </button>
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

      {/* View Profile Modal Overlay */}
      {viewingMember && (
        <div className={styles.modalOverlay} onClick={() => setViewingMember(null)}>
          <div className={clsx(styles.modalContentLarge, "glass")} onClick={e => e.stopPropagation()}>
            <button className={styles.closeXBtn} onClick={() => setViewingMember(null)}>
              <X size={24} />
            </button>
            <div className={styles.modalHeaderLarge}>
              <div className={styles.avatarHuge}>
                {viewingMember.avatar ? <img src={viewingMember.avatar} alt="Avatar" /> : viewingMember.name.charAt(0)}
              </div>
              <div className={styles.modalHeaderInfo}>
                <h2>{viewingMember.name}</h2>
                <div className={styles.roleBadge} data-role={viewingMember.role}>
                  {viewingMember.role}
                </div>
                <p className={styles.email}><Mail size={16}/> {viewingMember.email}</p>
                <div className={styles.joinDate}>
                  <Calendar size={16} /> 
                  <span>Joined {format(new Date(viewingMember.joinedAt), "MMM yyyy")}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalBodyLarge}>
              <div className={styles.modalSection}>
                <h4>About Me</h4>
                <p className={styles.modalBio}>{viewingMember.bio || "No bio available."}</p>
              </div>
              
              <div className={styles.modalSection}>
                <h4>Skills & Expertise</h4>
                {viewingMember.skills ? (
                  <div className={styles.tagListLarge}>
                    {viewingMember.skills.split(',').map((skill, i) => (
                       <span key={i} className={styles.tag}>{skill.trim()}</span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.modalBio}>No tags available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
