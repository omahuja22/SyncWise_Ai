'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTeams } from '@/app/contexts/TeamContext';
import { getTeamMemberCount, isTeamAdmin } from '@/services/teamService';
import { motion, AnimatePresence } from 'framer-motion';
import JoinTeamModal from '@/app/components/JoinTeamModal';

export default function TeamsPage() {
  const { user } = useAuth();
  const { teams, addTeam, removeTeam, loading: teamsLoading, error: contextError } = useTeams();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [memberCounts, setMemberCounts] = useState<{ [teamId: string]: number }>({});
  const [adminStatus, setAdminStatus] = useState<{ [teamId: string]: boolean }>({});
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  // Fetch member counts and admin status when teams load
  useEffect(() => {
    const fetchTeamData = async () => {
      const counts: { [teamId: string]: number } = {};
      const adminStatuses: { [teamId: string]: boolean | null } = {};
      
      if (!user?.id) {
        console.log('⚠️  [TeamsPage] No user ID, skipping fetch');
        return;
      }

      console.log('🔹 [TeamsPage] Fetching admin status for', teams.length, 'teams');

      for (const team of teams) {
        try {
          const count = await getTeamMemberCount(team.id);
          counts[team.id] = count;

          const isAdmin = await isTeamAdmin(team.id, user.id);
          console.log(`🔹 [TeamsPage] Team ${team.id} - isAdmin: ${isAdmin}`);
          adminStatuses[team.id] = isAdmin;
        } catch (err: any) {
          console.error(`❌ [TeamsPage] Error fetching data for team ${team.id}:`, err.message);
          counts[team.id] = 0;
          // FALLBACK: Set to null on error so button still shows (will be caught at backend)
          adminStatuses[team.id] = null;
        }
      }
      
      console.log('✅ [TeamsPage] Admin statuses:', adminStatuses);
      setMemberCounts(counts);
      setAdminStatus(adminStatuses as { [teamId: string]: boolean });
    };

    if (teams.length > 0 && user?.id) {
      fetchTeamData();
    }
  }, [teams, user?.id]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      console.log('🔹 [TeamsPage] Creating team:', teamName);

      await addTeam(teamName);

      console.log('✅ [TeamsPage] Team created');
      setTeamName('');
      setSuccess('✓ Team created successfully');

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create team';
      console.error('❌ [TeamsPage] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      console.log('🔹 [TeamsPage] Deleting team:', teamId, '- User:', user.id);

      await removeTeam(teamId);

      console.log('✅ [TeamsPage] Team deleted:', teamId);
      setSuccess('✓ Team deleted successfully');
      setDeleteConfirm(null);

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete team';
      console.error('❌ [TeamsPage] Delete error:', errorMsg);
      setError(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Teams
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage and create teams for collaboration
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: 'rgb(59, 130, 246)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
          }}
        >
          🔗 Join by Code
        </button>
      </div>

      {/* Create Team Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Create New Team
        </h2>

        <form id="team-form" onSubmit={handleCreateTeam} className="flex gap-3">
          <input
            type="text"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              setError(null);
            }}
            placeholder="Enter team name (e.g., Engineering)"
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-success)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
            style={{
              backgroundColor: loading ? 'rgba(34, 197, 94, 0.6)' : 'var(--accent-success)',
              color: '#0b0b0f',
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              '+ Create'
            )}
          </button>
        </form>

        {/* Error Message */}
        {(error || contextError) && (
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
            ❌ {error || contextError}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            {success}
          </motion.div>
        )}
      </motion.div>

      {/* Teams List */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Your Teams {teams.length > 0 && `(${teams.length})`}
        </h2>

        {teamsLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-12 text-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-3xl mb-3">👥</p>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              No teams yet
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Create your first team above to start collaborating
            </p>
            <a
              href="#team-form"
              className="inline-block px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'var(--accent-success)',
                color: '#0b0b0f',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              Create First Team
            </a>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg overflow-hidden transition-all"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Clickable Content */}
                <Link href={`/dashboard/teams/${team.id}`}>
                  <div
                    className="p-4 cursor-pointer transition-all hover:bg-opacity-80"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                    }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold truncate"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {team.name}
                        </h3>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                          Created {new Date(team.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Member Count Badge */}
                      <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: 'var(--accent-success)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        <span>👥</span>
                        <span>{memberCounts[team.id] ?? 0}</span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Team Code:
                        </p>
                        <p
                          className="text-sm font-mono font-bold"
                          style={{ color: 'var(--accent-primary)', letterSpacing: '0.1em' }}
                        >
                          {team.team_code || 'N/A'}
                        </p>
                      </div>
                      {team.team_code && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(team.team_code!);
                            alert('✓ Team code copied to clipboard!');
                          }}
                          className="px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: 'rgb(59, 130, 246)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          📋 Copy
                        </button>
                      )}
                    </div>

                    <p className="text-xs" style={{ color: 'var(--accent-success)' }}>
                      👑 You are the {adminStatus[team.id] ? 'admin' : 'member'}
                    </p>
                  </div>
                </Link>

                {/* Delete Button - Only show for admins (or while loading) */}
                {(adminStatus[team.id] === true || adminStatus[team.id] === null) && (
                  <div
                    className="px-4 py-2 border-t"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <button
                      onClick={() => {
                        console.log('🗑️  [TeamsPage] Delete clicked for team:', team.id);
                        setDeleteConfirm(team.id);
                      }}
                      className="w-full px-3 py-1 rounded text-xs font-medium transition-all"
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
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join Team Modal */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => {
          setSuccess('✓ Successfully joined team!');
          setTimeout(() => setSuccess(null), 3000);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => !deleting && setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg p-6 max-w-sm w-full mx-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Delete Team?
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this team? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteTeam(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: deleting ? 'rgba(239, 68, 68, 0.6)' : '#ef4444',
                  color: 'white',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.8 : 1,
                }}
              >
                {deleting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
