'use client';

import { Task, TaskStatus } from '@/app/data/tasks';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');
};

export default function TaskCard({
  task,
  onStatusChange,
  onDelete,
  isDeleting = false,
  isUpdating = false,
}: TaskCardProps) {
  const getStatusColor = (status?: TaskStatus) => {
    // Normalize status to lowercase for safe comparison
    const normalizedStatus = status?.toLowerCase() ?? '';
    
    switch (normalizedStatus) {
      case 'done':
        return {
          label: 'Done',
          bg: 'rgba(34, 197, 94, 0.1)',
          text: '#22c55e',
        };
      case 'in-progress':
      case 'in_progress':
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
      default:
        // Fallback for undefined or unknown status
        return {
          label: status ?? 'Unknown',
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
      className="rounded-lg p-4 transition-all duration-300 backdrop-blur-sm border relative group"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: isDeleting ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isDeleting
          ? '0 12px 24px rgba(239, 68, 68, 0.12)'
          : '0 8px 16px rgba(0, 0, 0, 0.2)',
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!isDeleting && !isUpdating) {
          (e.currentTarget as HTMLElement).style.borderColor =
            'rgba(34, 197, 94, 0.3)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 12px 24px rgba(34, 197, 94, 0.12)';
          (e.currentTarget as HTMLElement).style.transform =
            'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDeleting) {
          (e.currentTarget as HTMLElement).style.borderColor =
            'rgba(255, 255, 255, 0.1)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 8px 16px rgba(0, 0, 0, 0.2)';
          (e.currentTarget as HTMLElement).style.transform =
            'translateY(0)';
        }
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
            {/* Assigned User - Safe with optional chaining */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center"
                style={{
                  backgroundColor: task.assigned_to?.name 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(107, 114, 128, 0.15)',
                  color: task.assigned_to?.name ? '#22c55e' : '#9ca3af',
                }}
                title={task.assigned_to?.name || 'Unassigned'}
              >
                {task.assigned_to?.avatar || getInitials(task.assigned_to?.name)}
              </div>
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {task.assigned_to?.name || 'Unassigned'}
              </span>
            </div>

            {/* Status Badge - CLICKABLE */}
            <button
              onClick={() => onStatusChange(task.id)}
              disabled={isUpdating}
              className="text-xs font-medium px-2 py-1 rounded transition-all hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: statusInfo?.bg ?? 'rgba(107, 114, 128, 0.1)',
                color: statusInfo?.text ?? '#9ca3af',
                border: `1px solid ${statusInfo?.text ?? '#9ca3af'}`,
                cursor: isUpdating ? 'not-allowed' : 'pointer',
              }}
            >
              {isUpdating ? '...' : statusInfo?.label ?? 'Unknown'}
            </button>
          </div>
        </div>

        {/* Right: Points + Deadline + Delete */}
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
          
          {/* Delete Button - Hidden by default, shows on hover */}
          <button
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
            }}
            title="Delete task"
          >
            {isDeleting ? '...' : '✕'}
          </button>
        </div>
      </div>
    </div>
  );
}
