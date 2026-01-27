"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface FriendGroupCardProps {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  memberCount: number;
  maxMembers: number;
  role: "owner" | "admin" | "member";
  inviteCode: string;
}

const roleLabels = {
  owner: { label: "Owner", color: "bg-[var(--coral)]" },
  admin: { label: "Admin", color: "bg-[var(--teal)]" },
  member: { label: "Member", color: "bg-[var(--cream-dark)]" },
};

export default function FriendGroupCard({
  id,
  name,
  description,
  emoji,
  memberCount,
  maxMembers,
  role,
}: FriendGroupCardProps) {
  const roleInfo = roleLabels[role];

  return (
    <Link href={`/friends/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[20px] p-5 shadow-[var(--shadow-soft)] border border-transparent hover:border-[var(--cream-dark)] transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left - Group info */}
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 bg-[var(--cream)] rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
            >
              {emoji}
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-[var(--text-primary)] truncate">
                  {name}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
              {description && (
                <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                  {description}
                </p>
              )}
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {memberCount} {memberCount === 1 ? "member" : "members"} · {maxMembers - memberCount} spots left
              </p>
            </div>
          </div>

          {/* Right - Arrow */}
          <div className="flex-shrink-0 text-[var(--text-muted)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
