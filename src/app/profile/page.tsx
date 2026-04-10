"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Tag, 
  Edit3, 
  Save, 
  X,
  Camera
} from "lucide-react";
import styles from "./Profile.module.css";
import { clsx } from "clsx";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "Passionate about building unified digital ecosystems for academic communities.",
    skills: "React, Next.js, System Architecture",
    location: "Campus Block A",
  });

  const handleSave = () => {
    // Simulate save logic
    setIsEditing(false);
  };

  if (!user) return <div>Please authorize first.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.coverImage} />
        <div className={styles.profileMeta}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user.name.charAt(0)}
              <button className={styles.cameraBtn}><Camera size={16} /></button>
            </div>
          </div>
          <div className={styles.nameSection}>
            <div className={styles.titleRow}>
              {isEditing ? (
                <input 
                  type="text" 
                  className={styles.nameInput}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <h1>{formData.name}</h1>
              )}
              <span className={styles.badge}>{user.role}</span>
            </div>
            <p className={styles.email}><Mail size={14} /> {user.email}</p>
          </div>
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                  <X size={18} /> Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave}>
                  <Save size={18} /> Save Changes
                </button>
              </>
            ) : (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <Edit3 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.mainCol}>
          <section className={clsx(styles.infoCard, "glass")}>
            <h3>About Me</h3>
            {isEditing ? (
              <textarea 
                className={styles.bioInput}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            ) : (
              <p>{formData.bio}</p>
            )}
          </section>

          <section className={clsx(styles.infoCard, "glass")}>
            <h3>Skills & Expertise</h3>
            {isEditing ? (
              <input 
                type="text" 
                className={styles.skillInput}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Separate with commas..."
              />
            ) : (
              <div className={styles.skillTags}>
                {formData.skills.split(",").map((skill, i) => (
                  <span key={i} className={styles.skillTag}>{skill.trim()}</span>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.sideCol}>
          <section className={clsx(styles.infoCard, "glass")}>
            <h3>Details</h3>
            <div className={styles.detailItem}>
              <MapPin size={16} />
              <div className={styles.detailInfo}>
                <label>Location</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                ) : (
                  <span>{formData.location}</span>
                )}
              </div>
            </div>
            <div className={styles.detailItem}>
              <Calendar size={16} />
              <div className={styles.detailInfo}>
                <label>Joined</label>
                <span>September 2023</span>
              </div>
            </div>
          </section>

          <section className={clsx(styles.infoCard, "glass")}>
            <h3>Clubs Membership</h3>
            <div className={styles.clubList}>
              {user.clubs.map(club => (
                <div key={club.id} className={styles.clubItem}>
                  <div className={styles.clubIcon}>#</div>
                  <div className={styles.clubText}>
                    <p>{club.name}</p>
                    <span>{club.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
