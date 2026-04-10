'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTeams } from '@/app/contexts/TeamContext';
import {
  getTeamMembers,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
  TeamMember,
} from '@/services/teamService';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { teams } = useTeams();

  const teamId = params.teamId as string;
  const team = teams.find((t) => t.id === teamId);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Current user's role in this team
  const [userRole, setUserRole] = useState<'leader' | 'member' | null>(null);

  // Load team members
  useEffect(() => {
    const loadMembers = async () => {
      if (!teamId) return;

      try {
        setLoading(true);
        setError(null);
        console.log('🔹 [TeamDetailPage] Loading members for team:', teamId);

        const teamMembers = await getTeamMembers(teamId);
        setMembers(teamMembers);
        console.log('✅ [TeamDetailPage] Loaded', teamMembers.length, 'members');

        // Get current user's role
        if (user?.id) {
          const userMember = teamMembers.find((m) => m.user_id === user.id);
          if (userMember) {
            setUserRole(userMember.role);
          }
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load members';
        console.error('❌ [TeamDetailPage] Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [teamId, user?.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setSuccess(null);

    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }

    if (!user?.id) {
      setInviteError('User not authenticated');
      return;
    }

    try {
      setInviting(true);
      console.log('🔹 [TeamDetailPage] Inviting:', inviteEmail);

      const result = await inviteTeamMember(teamId, inviteEmail);

      if (result.success) {
        setInviteEmail('');
        setSuccess(`✓ Invitation sent to ${inviteEmail}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to invite member';
      console.error('❌ [TeamDetailPage] Invite error:', errorMsg);
      setInviteError(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      console.log('🔹 [TeamDetailPage] Removing member:', memberId);
      await removeMember(teamId, memberId);

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSuccess(`✓ ${memberName} was removed`);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to remove member';
      console.error('❌ [TeamDetailPage] Remove error:', errorMsg);
      setError(errorMsg);
    }
  };

  if (!team) {
    return (
      <div className="p-6">
        <p style={{ color: 'var(--text-secondary)' }}>Team not found</p>
      </div>
    );
  }

  const isLeader = userRole === 'leader';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          {team.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          ❌ {error}
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          {success}
        </motion.div>
      )}

      {/* Invite Form (Leader Only) */}
      {isLeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-6"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Invite Member
          </h2>

          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError(null);
              }}
              placeholder="Enter email to invite"
              disabled={inviting}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                opacity: inviting ? 0.6 : 1,
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--accent-success)';
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--border)';
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.04)';
              }}
            />

            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
              style={{
                backgroundColor: inviting
                  ? 'rgba(34, 197, 94, 0.6)'
                  : 'var(--accent-success)',
                color: '#0b0b0f',
                opacity: inviting ? 0.8 : 1,
                cursor: inviting ? 'not-allowed' : 'pointer',
              }}
            >
              {inviting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Inviting...
                </>
              ) : (
                '+ Invite'
              )}
            </button>
          </form>

          {inviteError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              ❌ {inviteError}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Members List */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Team Members
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              No members yet. Invite someone to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const name = member.user_profiles?.full_name || 'Unknown';
              const email = member.user_profiles?.email || '';
              const isCurrentUser = user?.id === member.user_id;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg p-4 transition-all flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        backgroundColor: 'rgb(59, 130, 246)',
                        color: 'white',
                      }}
                    >
                      {name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {name}
                        {isCurrentUser && (
                          <span style={{ color: 'var(--accent-success)', marginLeft: '0.5rem' }}>
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {/* Role Badge */}
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor:
                          member.role === 'leader'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          member.role === 'leader'
                            ? 'var(--accent-success)'
                            : 'var(--text-secondary)',
                        border:
                          member.role === 'leader'
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {member.role === 'leader' ? '👑 Leader' : 'Member'}
                    </span>

                    {/* Remove Button (Leader Only, not self) */}
                    {isLeader && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(member.id, name)}
                        className="px-2 py-1 rounded text-xs font-medium transition-all"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
