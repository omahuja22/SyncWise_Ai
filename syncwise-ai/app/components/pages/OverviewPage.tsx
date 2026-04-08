'use client';

import { useTasks } from '@/hooks/useTasks';
import UserStatsDisplay from '../UserStatsDisplay';

export default function OverviewPage() {
  const { tasks, loading } = useTasks();

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      {/* Page Title */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of your tasks and performance
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserStatsDisplay />
      </div>

      {/* Task Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: totalTasks, color: '#22c55e' },
          { label: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
          { label: 'Completed', value: completedTasks, color: '#22c55e' },
          { label: 'Pending', value: pendingTasks, color: '#6b7280' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-6 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-[4px]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 16px 32px rgba(34, 197, 94, 0.12)';
                (e.currentTarget as HTMLElement).style.borderColor =
                  'rgba(34, 197, 94, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 8px 16px rgba(0, 0, 0, 0.2)';
              (e.currentTarget as HTMLElement).style.borderColor =
                'rgba(255, 255, 255, 0.1)';
            }}
          >
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: stat.color }}
            >
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
