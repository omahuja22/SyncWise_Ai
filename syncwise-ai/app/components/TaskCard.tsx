'use client';

import { Task, TaskStatus } from '@/app/data/tasks';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return {
          label: 'Done',
          bg: 'rgba(34, 197, 94, 0.1)',
          text: '#22c55e',
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          bg: 'rgba(245, 158, 11, 0.1)',
          text: '#f59e0b',
        };
      case 'pending':
        return {
          label: 'Pending',
          bg: 'rgba(107, 114, 128, 0.1)',
          text: '#9ca3af',
        };
    }
  };

  const statusInfo = getStatusColor(task.status);

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="rounded-lg p-4 transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          '1px solid var(--accent-success)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 8px 16px rgba(34, 197, 94, 0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          '1px solid var(--border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title + Info */}
        <div className="flex-1">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            {task.title}
          </h3>

          <div className="flex items-center justify-between gap-3">
            {/* Assigned User */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                }}
              >
                {task.assignedTo.avatar}
              </div>
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {task.assignedTo.name}
              </span>
            </div>

            {/* Status Badge - CLICKABLE */}
            <button
              onClick={() => onStatusChange(task.id)}
              className="text-xs font-medium px-2 py-1 rounded transition-all hover:scale-105"
              style={{
                backgroundColor: statusInfo.bg,
                color: statusInfo.text,
                border: `1px solid ${statusInfo.text}`,
                cursor: 'pointer',
              }}
            >
              {statusInfo.label}
            </button>
          </div>
        </div>

        {/* Right: Points + Deadline */}
        <div className="flex flex-col items-end gap-2">
          <div
            className="text-lg font-bold"
            style={{ color: 'var(--accent-success)' }}
          >
            {task.points}
          </div>
          {task.deadline && (
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatDeadline(task.deadline)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
