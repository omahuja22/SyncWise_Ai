'use client';

import { useUserStats } from '@/hooks/useUserStats';

interface UserStatsDisplayProps {
  userId?: string;
  compact?: boolean;
}

export default function UserStatsDisplay({
  userId,
  compact = false,
}: UserStatsDisplayProps) {
  const { stats, loading } = useUserStats(userId);

  if (loading || !stats) {
    return (
      <div
        className={`rounded-lg p-4 ${compact ? 'p-3' : ''} backdrop-blur-sm`}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="animate-pulse h-6 w-24 rounded" />
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="rounded-lg px-3 py-2 backdrop-blur-sm flex items-center gap-2"
        style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <span style={{ color: 'var(--accent-success)' }} className="text-sm font-semibold">
          {stats.total_points}
        </span>
        <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
          pts
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-4 space-y-3 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
          Total Points
        </span>
        <span
          style={{ color: 'var(--accent-success)' }}
          className="text-2xl font-bold"
        >
          {stats.total_points}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
          Tasks Completed
        </span>
        <span
          style={{ color: 'var(--foreground)' }}
          className="text-lg font-semibold"
        >
          {stats.tasks_completed}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            backgroundColor: 'var(--accent-success)',
            width: `${Math.min((stats.total_points / 100) * 100, 100)}%`,
          }}
        />
      </div>
      <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
        {Math.min(stats.total_points, 100)} / 100 to next level
      </p>
    </div>
  );
}
