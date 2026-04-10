'use client';

import { useEffect, useState } from 'react';
import { useTeams } from '@/app/contexts/TeamContext';
import { getLeaderboard, LeaderboardEntry } from '@/services/teamService';

export default function LeaderboardPage() {
  const { selectedTeamId } = useTeams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      console.log('🏆 [LeaderboardPage] Fetching leaderboard - selectedTeamId:', selectedTeamId);

      if (!selectedTeamId) {
        console.log('⚠️  [LeaderboardPage] No team selected');
        setLoading(false);
        setLeaderboard([]);
        return;
      }

      try {
        setLoading(true);
        const entries = await getLeaderboard(selectedTeamId);
        console.log('✅ [LeaderboardPage] Got leaderboard entries:', entries.length);
        setLeaderboard(entries);
      } catch (error) {
        console.error('❌ [LeaderboardPage] Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTeamId]);

  // Early return if no team selected
  if (!selectedTeamId && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Select a team to view rankings
          </p>
        </div>
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            👈 Select a team in the sidebar to see the leaderboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {leaderboard.length > 0 ? "Top performers" : "No team selected"}
        </p>
      </div>

      {/* Leaderboard Table */}
      {!loading && leaderboard.length > 0 ? (
        <div
          className="rounded-lg overflow-hidden backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-4 transition-all duration-300 hover:-translate-x-1 group"
              style={{
                borderBottom:
                  idx < leaderboard.length - 1
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : 'none',
                backgroundColor:
                  entry.rank === 1
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  entry.rank === 1
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'transparent';
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor:
                      entry.rank === 1
                        ? 'var(--accent-success)'
                        : 'rgba(255, 255, 255, 0.1)',
                    color:
                      entry.rank === 1
                        ? '#0b0b0f'
                        : 'var(--foreground)',
                  }}
                >
                  #{entry.rank}
                </div>
                <div>
                  <p
                    className="font-medium transition-colors duration-300"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {entry.name}
                  </p>
                </div>
              </div>
              <p
                className="text-lg font-bold transition-colors duration-300"
                style={{ color: 'var(--accent-success)' }}
              >
                {entry.points} pts
              </p>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div style={{ color: 'var(--text-secondary)' }} className="text-center py-8">
          Loading leaderboard...
        </div>
      ) : (
        <div
          className="rounded-lg p-8 text-center backdrop-blur-sm border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            Select a team to view the leaderboard
          </p>
        </div>
      )}
    </div>
  );
}
